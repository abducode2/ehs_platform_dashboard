-- جدول المستخدمين (للمصادقة)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('manager', 'supervisor')),
  project TEXT CHECK (project IN ('airport', 'medical', 'residential', NULL)),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول التصاريح
CREATE TABLE permits (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  type TEXT NOT NULL CHECK (type IN ('hot','cold','confined','heights','electrical')),
  project TEXT NOT NULL CHECK (project IN ('airport','medical','residential')),
  location TEXT NOT NULL,
  supervisor TEXT NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','closed')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول الملاحظات
CREATE TABLE notes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  type TEXT NOT NULL CHECK (type IN ('unsafeAct','unsafeCondition')),
  title TEXT NOT NULL,
  project TEXT NOT NULL CHECK (project IN ('airport','medical','residential')),
  location TEXT,
  severity TEXT NOT NULL CHECK (severity IN ('critical','high','medium','low')),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed')),
  date DATE DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول الحوادث
CREATE TABLE incidents (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('injury','electrical','slip','fall','fire','suffocation')),
  severity TEXT NOT NULL CHECK (severity IN ('critical','high','medium','low')),
  project TEXT NOT NULL CHECK (project IN ('airport','medical','residential')),
  location TEXT,
  injured TEXT,
  date DATE DEFAULT CURRENT_DATE,
  description TEXT,
  action TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول جلسات TBT
CREATE TABLE tbt_sessions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  topic TEXT NOT NULL,
  project TEXT NOT NULL CHECK (project IN ('airport','medical','residential')),
  location TEXT,
  date DATE NOT NULL,
  time TIME,
  trainer TEXT,
  attendees INTEGER DEFAULT 0,
  actual_attend INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول الرخص
CREATE TABLE licenses (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT NOT NULL,
  project TEXT NOT NULL CHECK (project IN ('airport','medical','residential')),
  issue_date DATE,
  expiry_date DATE,
  status TEXT NOT NULL DEFAULT 'valid' CHECK (status IN ('valid','expiring','expired')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- سياسات Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permits ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbt_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;

-- سياسات بسيطة (للمطور: يمكن توسيعها)
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can view all permits" ON permits FOR SELECT USING (true);
CREATE POLICY "Managers can insert/update/delete permits" ON permits FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'manager'));

-- كرر للجداول الأخرى (للتوفير مكتوبة فقط للpermits كمثال)