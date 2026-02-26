export const fetchMenuCategories = async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                { id: 'cat_coffee', name: 'Kahveler' },
                { id: 'cat_cold', name: 'Soğuk İçecekler' },
                { id: 'cat_snack', name: 'Yiyecek & Atıştırmalık' },
                { id: 'cat_bean', name: 'Çekirdek Kahve' }
            ]);
        }, 500); // Fake network delay
    });
};

export const fetchProducts = async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                {
                    id: 'prod_1',
                    name: 'Caffe Latte',
                    description: 'Taze çekilmiş espresso ve sıcak ipeksi kremanın buluşması.',
                    price: 85,
                    category: 'cat_coffee',
                    imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=1000&auto=format&fit=crop',
                    allergens: ['Milk'],
                    extras: ['Ekstra Shot', 'Karamel Şurup', 'Badem Sütü'],
                    isAvailable: true,
                    nutrition: { calories: 120, caffeine: 75, protein: 6, fat: 4 }
                },
                {
                    id: 'prod_2',
                    name: 'Filtre Kahve',
                    description: 'Ethiopia Yirgacheffe çekirdekleriyle demlenmiş klasik damla kahve.',
                    price: 65,
                    category: 'cat_coffee',
                    imageUrl: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=1000&auto=format&fit=crop',
                    allergens: [],
                    extras: ['Süt', 'Şurup'],
                    isAvailable: true,
                    nutrition: { calories: 5, caffeine: 150, protein: 0, fat: 0 }
                },
                {
                    id: 'prod_3',
                    name: 'Mocha',
                    description: 'Espresso, sıcak çikolata mantığı ve taze köpüklü sütün harika uyumu.',
                    price: 95,
                    category: 'cat_coffee',
                    imageUrl: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=1000&auto=format&fit=crop',
                    allergens: ['Milk'],
                    extras: ['Krema', 'Ekstra Çikolata'],
                    isAvailable: true,
                    nutrition: { calories: 250, caffeine: 80, protein: 7, fat: 9 }
                },
                {
                    id: 'prod_4',
                    name: 'Iced Americano',
                    description: 'Buz üzerinde sert ve yoğun espresso shotı. Serinletici.',
                    price: 70,
                    category: 'cat_cold',
                    imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=1000&auto=format&fit=crop',
                    allergens: [],
                    extras: ['Ekstra Buz', 'Pompa Şurup'],
                    isAvailable: true,
                    nutrition: { calories: 10, caffeine: 160, protein: 0, fat: 0 }
                },
                {
                    id: 'prod_5',
                    name: 'San Sebastian Cheesecake',
                    description: 'Yanık yüzeyli, içi akışkan krem peynir dolgulu imza tatlımız.',
                    price: 130,
                    category: 'cat_snack',
                    imageUrl: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=1000&auto=format&fit=crop',
                    allergens: ['Milk', 'Gluten', 'Egg'],
                    extras: ['Çikolata Sos'],
                    isAvailable: true,
                    nutrition: { calories: 450, caffeine: 0, protein: 8, fat: 32 }
                }
            ]);
        }, 600);
    });
};

export const fetchBranches = async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                {
                    id: 'branch_1',
                    name: 'Shaco Coffee - Meram',
                    address: 'Melikşah, Melikşah Cd. NO:121/A, 42090 Meram/Konya',
                    phone: '+90 553 697 09 07',
                    email: 'iletisim@shacocoffee.com',
                    instagram: '@shacocoffee',
                    coordinates: { lat: 37.8560, lng: 32.4380 },
                    workingHours: {
                        "Pazartesi": "09:30-00:00",
                        "Salı": "09:30-00:00",
                        "Çarşamba": "09:30-00:00",
                        "Perşembe": "09:30-00:00",
                        "Cuma": "09:30-00:00",
                        "Cumartesi": "09:30-00:00",
                        "Pazar": "09:30-00:00"
                    }
                }
            ]);
        }, 300);
    });
};
