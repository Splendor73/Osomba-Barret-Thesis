-- ============================================================================
-- DATABASE SCHEMA VIEWER - All Tables
-- Run this in pgAdmin Query Tool to see detailed table structures
-- ============================================================================

-- ============================================================================
-- SECTION 1: List All Tables
-- ============================================================================
SELECT 
    '📋 ALL TABLES IN DATABASE' AS info,
    COUNT(*) AS total_tables
FROM information_schema.tables 
WHERE table_schema = 'public';

SELECT table_name AS "Table Name"
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- ============================================================================
-- SECTION 2: Detailed Column Information for Each Table
-- ============================================================================

-- AUCTION TABLE
SELECT 
    'AUCTION' AS "📋 Table",
    column_name AS "Column Name",
    data_type AS "Data Type",
    character_maximum_length AS "Max Length",
    is_nullable AS "Nullable",
    column_default AS "Default Value"
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'auction'
ORDER BY ordinal_position;

-- BIDS TABLE
SELECT 
    'BIDS' AS "📋 Table",
    column_name AS "Column Name",
    data_type AS "Data Type",
    character_maximum_length AS "Max Length",
    is_nullable AS "Nullable",
    column_default AS "Default Value"
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'bids'
ORDER BY ordinal_position;

-- MESSAGES TABLE
SELECT 
    'MESSAGES' AS "📋 Table",
    column_name AS "Column Name",
    data_type AS "Data Type",
    character_maximum_length AS "Max Length",
    is_nullable AS "Nullable",
    column_default AS "Default Value"
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'messages'
ORDER BY ordinal_position;

-- NOTIFICATIONS TABLE
SELECT 
    'NOTIFICATIONS' AS "📋 Table",
    column_name AS "Column Name",
    data_type AS "Data Type",
    character_maximum_length AS "Max Length",
    is_nullable AS "Nullable",
    column_default AS "Default Value"
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'notifications'
ORDER BY ordinal_position;

-- ORDERS TABLE
SELECT 
    'ORDERS' AS "📋 Table",
    column_name AS "Column Name",
    data_type AS "Data Type",
    character_maximum_length AS "Max Length",
    is_nullable AS "Nullable",
    column_default AS "Default Value"
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'orders'
ORDER BY ordinal_position;

-- ORDER_ITEMS TABLE
SELECT 
    'ORDER_ITEMS' AS "📋 Table",
    column_name AS "Column Name",
    data_type AS "Data Type",
    character_maximum_length AS "Max Length",
    is_nullable AS "Nullable",
    column_default AS "Default Value"
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'order_items'
ORDER BY ordinal_position;

-- PAYMENT TABLE
SELECT 
    'PAYMENT' AS "📋 Table",
    column_name AS "Column Name",
    data_type AS "Data Type",
    character_maximum_length AS "Max Length",
    is_nullable AS "Nullable",
    column_default AS "Default Value"
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'payment'
ORDER BY ordinal_position;

-- PRODUCT TABLE
SELECT 
    'PRODUCT' AS "📋 Table",
    column_name AS "Column Name",
    data_type AS "Data Type",
    character_maximum_length AS "Max Length",
    is_nullable AS "Nullable",
    column_default AS "Default Value"
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'product'
ORDER BY ordinal_position;

-- REVIEWS TABLE
SELECT 
    'REVIEWS' AS "📋 Table",
    column_name AS "Column Name",
    data_type AS "Data Type",
    character_maximum_length AS "Max Length",
    is_nullable AS "Nullable",
    column_default AS "Default Value"
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'reviews'
ORDER BY ordinal_position;

-- USERS TABLE
SELECT 
    'USERS' AS "📋 Table",
    column_name AS "Column Name",
    data_type AS "Data Type",
    character_maximum_length AS "Max Length",
    is_nullable AS "Nullable",
    column_default AS "Default Value"
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

-- ============================================================================
-- SECTION 3: All Columns in All Tables (Summary View)
-- ============================================================================
SELECT 
    table_name AS "Table",
    column_name AS "Column",
    data_type AS "Type",
    character_maximum_length AS "Max Length",
    is_nullable AS "Nullable",
    column_default AS "Default"
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- ============================================================================
-- SECTION 4: Foreign Key Relationships
-- ============================================================================
SELECT
    tc.table_name AS "From Table",
    kcu.column_name AS "From Column",
    ccu.table_name AS "To Table",
    ccu.column_name AS "To Column",
    tc.constraint_name AS "Constraint Name"
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- ============================================================================
-- SECTION 5: Primary Keys for All Tables
-- ============================================================================
SELECT
    tc.table_name AS "Table Name",
    kcu.column_name AS "Primary Key Column",
    tc.constraint_name AS "Constraint Name"
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE tc.constraint_type = 'PRIMARY KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- ============================================================================
-- SECTION 6: Indexes
-- ============================================================================
SELECT
    schemaname AS "Schema",
    tablename AS "Table Name",
    indexname AS "Index Name",
    indexdef AS "Index Definition"
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
