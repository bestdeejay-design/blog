-- Check news content to see if it has HTML tags
SELECT 
  id,
  title,
  LEFT(content, 200) as content_preview,
  CASE 
    WHEN content LIKE '%<%' THEN 'Has HTML'
    ELSE 'Plain text'
  END as content_type,
  created_at
FROM news
ORDER BY created_at DESC
LIMIT 10;
