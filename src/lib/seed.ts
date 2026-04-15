import prisma from './db';
import { hashPassword } from './auth';

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await hashPassword('Admin123!');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@nabk.sy' },
    update: {},
    create: {
      email: 'admin@nabk.sy',
      passwordHash: adminPassword,
      fullName: 'مدير النظام',
      role: 'SUPER_ADMIN',
      isEmailVerified: true,
    },
  });
  console.log('✅ Created admin user:', admin.email);

  // Create city
  const city = await prisma.city.upsert({
    where: { id: 'default-city' },
    update: {},
    create: {
      id: 'default-city',
      nameArabic: 'النبك',
      nameEnglish: 'Al Nabk',
    },
  });
  console.log('✅ Created city:', city.nameArabic);

  // Create categories
  const categories = [
    { nameArabic: 'مطاعم ومقاهي', nameEnglish: 'Restaurants & Cafes', slugArabic: 'restaurants-cafes', slugEnglish: 'restaurants-cafes', icon: '🍽️' },
    { nameArabic: 'محلات تجارية', nameEnglish: 'Shops & Stores', slugArabic: 'shops', slugEnglish: 'shops', icon: '🏪' },
    { nameArabic: 'خدمات طبية', nameEnglish: 'Medical Services', slugArabic: 'medical', slugEnglish: 'medical', icon: '🏥' },
    { nameArabic: 'خدمات تعليمية', nameEnglish: 'Educational Services', slugArabic: 'education', slugEnglish: 'education', icon: '📚' },
    { nameArabic: 'خدمات مالية ومصرفية', nameEnglish: 'Financial Services', slugArabic: 'financial', slugEnglish: 'financial', icon: '🏦' },
    { nameArabic: 'صيانة وإصلاح', nameEnglish: 'Maintenance & Repair', slugArabic: 'maintenance', slugEnglish: 'maintenance', icon: '🔧' },
    { nameArabic: 'مواصلات ونقل', nameEnglish: 'Transport & Logistics', slugArabic: 'transport', slugEnglish: 'transport', icon: '🚗' },
    { nameArabic: 'جمال وعناية', nameEnglish: 'Beauty & Care', slugArabic: 'beauty', slugEnglish: 'beauty', icon: '💄' },
    { nameArabic: 'بناء وتشييد', nameEnglish: 'Construction & Real Estate', slugArabic: 'construction', slugEnglish: 'construction', icon: '🏗️' },
    { nameArabic: 'خدمات تقنية', nameEnglish: 'IT Services', slugArabic: 'it-services', slugEnglish: 'it-services', icon: '💻' },
    { nameArabic: 'طعام ومواد غذائية', nameEnglish: 'Food & Grocery', slugArabic: 'food', slugEnglish: 'food', icon: '🍞' },
    { nameArabic: 'رياضة وترفيه', nameEnglish: 'Sports & Recreation', slugArabic: 'sports', slugEnglish: 'sports', icon: '⚽' },
    { nameArabic: 'فنادق وأماكن إقامة', nameEnglish: 'Hotels & Accommodation', slugArabic: 'hotels', slugEnglish: 'hotels', icon: '🏨' },
    { nameArabic: 'خدمات متنوعة', nameEnglish: 'Miscellaneous Services', slugArabic: 'misc', slugEnglish: 'misc', icon: '📌' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slugArabic: cat.slugArabic },
      update: {},
      create: {
        nameArabic: cat.nameArabic,
        nameEnglish: cat.nameEnglish,
        slugArabic: cat.slugArabic,
        slugEnglish: cat.slugEnglish,
        icon: cat.icon,
        sortOrder: categories.indexOf(cat),
      },
    });
  }
  console.log('✅ Created categories:', categories.length);

  // Get a category for sample business
  const restaurantCategory = await prisma.category.findUnique({
    where: { slugArabic: 'restaurants-cafes' },
  });

  // Create sample businesses
  if (restaurantCategory) {
    await prisma.businessProfile.upsert({
      where: { id: 'sample-business-1' },
      update: {},
      create: {
        id: 'sample-business-1',
        ownerId: admin.id,
        cityId: city.id,
        categoryId: restaurantCategory.id,
        nameArabic: 'مطعم الوادي',
        nameEnglish: 'Al Wadi Restaurant',
        descriptionArabic: 'أشهى المأكولات المحلية والعربية في قلب النبك',
        descriptionEnglish: 'The finest local and Arab cuisine in the heart of Al Nabk',
        addressArabic: 'شارع الرئيسية، النبك',
        addressEnglish: 'Main Street, Al Nabk',
        website: 'https://example.com',
        email: 'info@alwadi.restaurant',
        status: 'ACTIVE',
        searchText: 'مطعم الوادي restaurant food arabic nabk',
        phones: {
          create: [
            { number: '0111234567', labelArabic: 'للحجز', labelEnglish: 'For reservations', isPrimary: true },
          ],
        },
        hours: {
          create: [
            { dayOfWeek: 0, openTime: '10:00', closeTime: '23:00' },
            { dayOfWeek: 1, openTime: '10:00', closeTime: '23:00' },
            { dayOfWeek: 2, openTime: '10:00', closeTime: '23:00' },
            { dayOfWeek: 3, openTime: '10:00', closeTime: '23:00' },
            { dayOfWeek: 4, openTime: '10:00', closeTime: '23:00' },
            { dayOfWeek: 5, openTime: '10:00', closeTime: '23:00' },
            { dayOfWeek: 6, openTime: '10:00', closeTime: '23:00' },
          ],
        },
        socialLinks: {
          create: [
            { platform: 'FACEBOOK', url: 'https://facebook.com/alwadi' },
            { platform: 'INSTAGRAM', url: 'https://instagram.com/alwadi' },
          ],
        },
      },
    });
    console.log('✅ Created sample business');
  }

  // Create platform settings
  await prisma.platformSettings.upsert({
    where: { key: 'site_name' },
    update: {},
    create: { key: 'site_name', valueArabic: 'دليل النبك', valueEnglish: 'Daleel Al-Nabk' },
  });

  await prisma.platformSettings.upsert({
    where: { key: 'contact_email' },
    update: {},
    create: { key: 'contact_email', valueArabic: 'info@nabk.sy', valueEnglish: 'info@nabk.sy' },
  });

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });