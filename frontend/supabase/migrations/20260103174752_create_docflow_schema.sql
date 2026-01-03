/*
  # DocFlow HR Database Schema

  ## Overview
  Creates the complete database schema for DocFlow HR employee document management system.

  ## New Tables
  
  ### `employees`
  - `id` (uuid, primary key) - Unique employee identifier
  - `email` (text, unique) - Employee email address
  - `name` (text) - Full name
  - `phone` (text) - Phone number for SMS intake
  - `department` (text) - Department name
  - `state` (text) - Employee work state (FL, TX, AZ, NC, TN)
  - `status` (text) - Employment status (active, inactive, terminated)
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `documents`
  - `id` (uuid, primary key) - Unique document identifier
  - `employee_id` (uuid, foreign key) - Reference to employee
  - `type` (text) - Document type (I-9, W-4, Direct Deposit, etc.)
  - `status` (text) - Document status (received, in_review, approved, rejected, expired, on_hold)
  - `source` (text) - Submission source (upload, email, sms, drive)
  - `file_url` (text) - File storage URL (mocked for demo)
  - `file_name` (text) - Original file name
  - `file_size` (integer) - File size in bytes
  - `issue_date` (date) - Document issue date
  - `expiration_date` (date) - Document expiration date
  - `priority` (text) - Priority level (low, medium, high)
  - `notes` (text) - HR notes or rejection reason
  - `reviewed_by` (text) - HR reviewer name
  - `reviewed_at` (timestamptz) - Review timestamp
  - `version` (integer) - Version number for resubmissions
  - `original_document_id` (uuid) - Reference to original if resubmission
  - `created_at` (timestamptz) - Submission timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `legal_holds`
  - `id` (uuid, primary key) - Unique hold identifier
  - `title` (text) - Hold title
  - `reason` (text) - Reason for hold
  - `status` (text) - Hold status (active, released)
  - `created_by` (text) - Creator name
  - `employee_ids` (uuid[]) - Array of affected employee IDs
  - `department` (text) - Department scope
  - `document_category` (text) - Document type scope
  - `date_from` (date) - Start date for document scope
  - `date_to` (date) - End date for document scope
  - `created_at` (timestamptz) - Hold creation timestamp
  - `released_at` (timestamptz) - Hold release timestamp

  ### `activity_logs`
  - `id` (uuid, primary key) - Unique log identifier
  - `entity_type` (text) - Type of entity (document, employee, hold)
  - `entity_id` (uuid) - Reference to entity
  - `event_type` (text) - Event type (submitted, reviewed, approved, rejected, hold_applied, etc.)
  - `actor_name` (text) - Person who performed action
  - `actor_role` (text) - Role (employee, hr_admin, hr_manager, legal)
  - `description` (text) - Human-readable description
  - `metadata` (jsonb) - Additional event data
  - `created_at` (timestamptz) - Event timestamp

  ### `retention_policies`
  - `id` (uuid, primary key) - Unique policy identifier
  - `state` (text) - State code (FL, TX, AZ, NC, TN)
  - `document_type` (text) - Document type
  - `retention_period_days` (integer) - Retention period in days
  - `is_override` (boolean) - Whether this is a custom override
  - `created_at` (timestamptz) - Policy creation timestamp

  ## Security
  - Enable RLS on all tables
  - Public access for demo purposes (in production would be properly restricted)
*/

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  phone text,
  department text,
  state text DEFAULT 'FL',
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  type text,
  status text DEFAULT 'received',
  source text DEFAULT 'upload',
  file_url text,
  file_name text,
  file_size integer,
  issue_date date,
  expiration_date date,
  priority text DEFAULT 'medium',
  notes text,
  reviewed_by text,
  reviewed_at timestamptz,
  version integer DEFAULT 1,
  original_document_id uuid REFERENCES documents(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create legal_holds table
CREATE TABLE IF NOT EXISTS legal_holds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  reason text,
  status text DEFAULT 'active',
  created_by text NOT NULL,
  employee_ids uuid[],
  department text,
  document_category text,
  date_from date,
  date_to date,
  created_at timestamptz DEFAULT now(),
  released_at timestamptz
);

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid,
  event_type text NOT NULL,
  actor_name text NOT NULL,
  actor_role text NOT NULL,
  description text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create retention_policies table
CREATE TABLE IF NOT EXISTS retention_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  state text NOT NULL,
  document_type text NOT NULL,
  retention_period_days integer NOT NULL,
  is_override boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(state, document_type)
);

-- Enable RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_holds ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE retention_policies ENABLE ROW LEVEL SECURITY;

-- Create policies (permissive for demo)
CREATE POLICY "Allow all operations on employees"
  ON employees FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on documents"
  ON documents FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on legal_holds"
  ON legal_holds FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on activity_logs"
  ON activity_logs FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on retention_policies"
  ON retention_policies FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_documents_employee_id ON documents(employee_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_employees_updated_at ON employees;
CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();