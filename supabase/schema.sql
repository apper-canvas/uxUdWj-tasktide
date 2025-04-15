-- Schema creation for TaskTide app

-- Extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security on all tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, service_role;

-- PROFILES table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  job_title TEXT,
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- PROJECTS table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'completed')),
  color TEXT DEFAULT '#4f46e5',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- PROJECT_MEMBERS table (junction table for project collaborators)
CREATE TABLE IF NOT EXISTS public.project_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(project_id, user_id)
);

-- CATEGORIES table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  color TEXT DEFAULT '#4f46e5',
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(name, project_id)
);

-- TASKS table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date TIMESTAMP WITH TIME ZONE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- TASK_ASSIGNMENTS table
CREATE TABLE IF NOT EXISTS public.task_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(task_id, user_id)
);

-- COMMENTS table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- TAGS table
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  color TEXT DEFAULT '#4f46e5',
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(name, project_id)
);

-- TASK_TAGS junction table
CREATE TABLE IF NOT EXISTS public.task_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(task_id, tag_id)
);

-- ACTIVITY_LOGS table
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- FUNCTIONS

-- Function to create a profile after a user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log task activity
CREATE OR REPLACE FUNCTION public.log_task_activity()
RETURNS TRIGGER AS $$
DECLARE
  action_type TEXT;
  details_json JSONB;
BEGIN
  -- Determine action type
  IF (TG_OP = 'INSERT') THEN
    action_type := 'created';
    details_json := jsonb_build_object(
      'title', NEW.title,
      'status', NEW.status,
      'priority', NEW.priority
    );
  ELSIF (TG_OP = 'UPDATE') THEN
    action_type := 'updated';
    details_json := jsonb_build_object(
      'title', NEW.title,
      'old_status', OLD.status,
      'new_status', NEW.status,
      'old_priority', OLD.priority,
      'new_priority', NEW.priority
    );
  ELSIF (TG_OP = 'DELETE') THEN
    action_type := 'deleted';
    details_json := jsonb_build_object(
      'title', OLD.title,
      'status', OLD.status,
      'priority', OLD.priority
    );
  END IF;

  -- Insert activity log
  INSERT INTO public.activity_logs (
    user_id,
    project_id,
    task_id,
    action,
    details
  ) VALUES (
    CASE
      WHEN TG_OP = 'DELETE' THEN auth.uid()
      ELSE COALESCE(NEW.created_by, auth.uid())
    END,
    CASE
      WHEN TG_OP = 'DELETE' THEN OLD.project_id
      ELSE NEW.project_id
    END,
    CASE
      WHEN TG_OP = 'DELETE' THEN OLD.id
      ELSE NEW.id
    END,
    action_type,
    details_json
  );
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log project activity
CREATE OR REPLACE FUNCTION public.log_project_activity()
RETURNS TRIGGER AS $$
DECLARE
  action_type TEXT;
  details_json JSONB;
BEGIN
  -- Determine action type
  IF (TG_OP = 'INSERT') THEN
    action_type := 'project_created';
    details_json := jsonb_build_object(
      'name', NEW.name,
      'status', NEW.status
    );
  ELSIF (TG_OP = 'UPDATE') THEN
    action_type := 'project_updated';
    details_json := jsonb_build_object(
      'name', NEW.name,
      'old_status', OLD.status,
      'new_status', NEW.status
    );
  ELSIF (TG_OP = 'DELETE') THEN
    action_type := 'project_deleted';
    details_json := jsonb_build_object(
      'name', OLD.name,
      'status', OLD.status
    );
  END IF;

  -- Insert activity log
  INSERT INTO public.activity_logs (
    user_id,
    project_id,
    action,
    details
  ) VALUES (
    CASE
      WHEN TG_OP = 'DELETE' THEN auth.uid()
      ELSE COALESCE(NEW.owner_id, auth.uid())
    END,
    CASE
      WHEN TG_OP = 'DELETE' THEN OLD.id
      ELSE NEW.id
    END,
    action_type,
    details_json
  );
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- TRIGGERS

-- Trigger for creating a profile after user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger for logging task activities
CREATE TRIGGER on_task_activity
  AFTER INSERT OR UPDATE OR DELETE ON public.tasks
  FOR EACH ROW EXECUTE PROCEDURE public.log_task_activity();

-- Trigger for logging project activities
CREATE TRIGGER on_project_activity
  AFTER INSERT OR UPDATE OR DELETE ON public.projects
  FOR EACH ROW EXECUTE PROCEDURE public.log_project_activity();

-- Enable Row Level Security for all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- POLICIES

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can view profiles of project members"
  ON public.profiles FOR SELECT
  USING (
    id IN (
      SELECT user_id FROM public.project_members
      WHERE project_id IN (
        SELECT project_id FROM public.project_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- Projects policies
CREATE POLICY "Users can view their projects"
  ON public.projects FOR SELECT
  USING (
    id IN (
      SELECT project_id FROM public.project_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create projects"
  ON public.projects FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Project owners can update their projects"
  ON public.projects FOR UPDATE
  USING (
    owner_id = auth.uid() OR
    auth.uid() IN (
      SELECT user_id FROM public.project_members
      WHERE project_id = id AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Project owners can delete their projects"
  ON public.projects FOR DELETE
  USING (
    owner_id = auth.uid() OR
    auth.uid() IN (
      SELECT user_id FROM public.project_members
      WHERE project_id = id AND role = 'owner'
    )
  );

-- Project members policies
CREATE POLICY "Users can view project members"
  ON public.project_members FOR SELECT
  USING (
    project_id IN (
      SELECT project_id FROM public.project_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Project admins can add project members"
  ON public.project_members FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.project_members
      WHERE project_id = project_members.project_id AND role IN ('owner', 'admin')
    ) OR
    (SELECT owner_id FROM public.projects WHERE id = project_id) = auth.uid()
  );

CREATE POLICY "Project admins can update project members"
  ON public.project_members FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.project_members
      WHERE project_id = project_members.project_id AND role IN ('owner', 'admin')
    ) OR
    (SELECT owner_id FROM public.projects WHERE id = project_id) = auth.uid()
  );

CREATE POLICY "Project admins can delete project members"
  ON public.project_members FOR DELETE
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.project_members
      WHERE project_id = project_members.project_id AND role IN ('owner', 'admin')
    ) OR
    (SELECT owner_id FROM public.projects WHERE id = project_id) = auth.uid()
  );

-- Tasks policies
CREATE POLICY "Users can view tasks in their projects"
  ON public.tasks FOR SELECT
  USING (
    project_id IN (
      SELECT project_id FROM public.project_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Project members can create tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT project_id FROM public.project_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Project members can update tasks"
  ON public.tasks FOR UPDATE
  USING (
    project_id IN (
      SELECT project_id FROM public.project_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Project members can delete tasks"
  ON public.tasks FOR DELETE
  USING (
    project_id IN (
      SELECT project_id FROM public.project_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    ) OR
    created_by = auth.uid()
  );

-- Task assignments policies
CREATE POLICY "Users can view task assignments in their projects"
  ON public.task_assignments FOR SELECT
  USING (
    task_id IN (
      SELECT id FROM public.tasks
      WHERE project_id IN (
        SELECT project_id FROM public.project_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Project members can create task assignments"
  ON public.task_assignments FOR INSERT
  WITH CHECK (
    task_id IN (
      SELECT id FROM public.tasks
      WHERE project_id IN (
        SELECT project_id FROM public.project_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Project members can delete task assignments"
  ON public.task_assignments FOR DELETE
  USING (
    task_id IN (
      SELECT id FROM public.tasks
      WHERE project_id IN (
        SELECT project_id FROM public.project_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
      )
    ) OR
    (SELECT created_by FROM public.tasks WHERE id = task_id) = auth.uid()
  );

-- Comments policies
CREATE POLICY "Users can view comments in their projects"
  ON public.comments FOR SELECT
  USING (
    task_id IN (
      SELECT id FROM public.tasks
      WHERE project_id IN (
        SELECT project_id FROM public.project_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Project members can create comments"
  ON public.comments FOR INSERT
  WITH CHECK (
    task_id IN (
      SELECT id FROM public.tasks
      WHERE project_id IN (
        SELECT project_id FROM public.project_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update their own comments"
  ON public.comments FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments"
  ON public.comments FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "Project admins can delete any comment"
  ON public.comments FOR DELETE
  USING (
    task_id IN (
      SELECT id FROM public.tasks
      WHERE project_id IN (
        SELECT project_id FROM public.project_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
      )
    )
  );

-- Categories policies
CREATE POLICY "Users can view categories in their projects"
  ON public.categories FOR SELECT
  USING (
    project_id IN (
      SELECT project_id FROM public.project_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Project members can create categories"
  ON public.categories FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT project_id FROM public.project_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Project admins can update categories"
  ON public.categories FOR UPDATE
  USING (
    project_id IN (
      SELECT project_id FROM public.project_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Project admins can delete categories"
  ON public.categories FOR DELETE
  USING (
    project_id IN (
      SELECT project_id FROM public.project_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Tags policies
CREATE POLICY "Users can view tags in their projects"
  ON public.tags FOR SELECT
  USING (
    project_id IN (
      SELECT project_id FROM public.project_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Project members can create tags"
  ON public.tags FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT project_id FROM public.project_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Project admins can update tags"
  ON public.tags FOR UPDATE
  USING (
    project_id IN (
      SELECT project_id FROM public.project_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Project admins can delete tags"
  ON public.tags FOR DELETE
  USING (
    project_id IN (
      SELECT project_id FROM public.project_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Task tags policies
CREATE POLICY "Users can view task tags in their projects"
  ON public.task_tags FOR SELECT
  USING (
    task_id IN (
      SELECT id FROM public.tasks
      WHERE project_id IN (
        SELECT project_id FROM public.project_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Project members can add tags to tasks"
  ON public.task_tags FOR INSERT
  WITH CHECK (
    task_id IN (
      SELECT id FROM public.tasks
      WHERE project_id IN (
        SELECT project_id FROM public.project_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Project members can remove tags from tasks"
  ON public.task_tags FOR DELETE
  USING (
    task_id IN (
      SELECT id FROM public.tasks
      WHERE project_id IN (
        SELECT project_id FROM public.project_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- Activity logs policies
CREATE POLICY "Users can view activity logs in their projects"
  ON public.activity_logs FOR SELECT
  USING (
    project_id IN (
      SELECT project_id FROM public.project_members
      WHERE user_id = auth.uid()
    )
  );

-- Initial setup for a new installation
-- Create default categories for new projects
CREATE OR REPLACE FUNCTION public.create_default_categories()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.categories (name, color, project_id)
  VALUES
    ('To Do', '#60a5fa', NEW.id),
    ('In Progress', '#f59e0b', NEW.id),
    ('Review', '#8b5cf6', NEW.id),
    ('Done', '#10b981', NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to add default categories when a project is created
CREATE TRIGGER on_project_created
  AFTER INSERT ON public.projects
  FOR EACH ROW EXECUTE PROCEDURE public.create_default_categories();

-- Add the project owner as a member with 'owner' role
CREATE OR REPLACE FUNCTION public.add_project_owner_as_member()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.project_members (project_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to add owner as a member when a project is created
CREATE TRIGGER on_project_created_add_owner
  AFTER INSERT ON public.projects
  FOR EACH ROW EXECUTE PROCEDURE public.add_project_owner_as_member();