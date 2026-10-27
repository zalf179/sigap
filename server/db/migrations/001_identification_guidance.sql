INSERT INTO waste_categories (name, description, handling_instruction)
SELECT 'Residu',
       'Sampah yang sulit didaur ulang melalui pemilahan rumah tangga.',
       'Pisahkan dari bahan daur ulang dan buang dalam wadah residu tertutup.'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM waste_categories WHERE name = 'Residu');

UPDATE waste_categories
SET handling_instruction = 'Pastikan bahan daur ulang bersih dan kering, pisahkan menurut jenisnya, lalu setorkan ke tempat pemilahan.'
WHERE name = 'Anorganik'
  AND handling_instruction LIKE '%kaca bisa tajam - bungkus dengan aman%';
