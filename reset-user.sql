-- Delete all test users and reset to original
DELETE FROM user_profiles WHERE username = 'admin';

-- Update your user with correct password
UPDATE user_profiles 
SET username = 'best',
    password = '$2a$10$rE3vZb7X9kFqPzH8wN2jL.dYvK5mT6pQ8sR4uW1xY0zA2bC3dE4fG'
WHERE email = 'dj@li.ru';

-- Verify
SELECT id, username, email, role FROM user_profiles;
