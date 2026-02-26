import { db } from '../firebase';
import { doc, getDoc, updateDoc, setDoc, onSnapshot } from 'firebase/firestore';

// Zod Data Validation (Phase 8 Hazırlığı - Gelecekte Serverless fonksiyona taşınacak)
// export const SiteConfigSchema = z.object({
//    heroTitle: z.string(),
//    heroSubtitle: z.string(),
//    heroBgUrl: z.string().url(),
//    features: z.array(z.object({ title: z.string(), desc: z.string() }))
// });

export const subscribeToSiteConfig = (callback) => {
    return onSnapshot(doc(db, 'siteConfig', 'main'), (docSnap) => {
        if (docSnap.exists()) {
            callback(docSnap.data());
        } else {
            // Default config if none exists
            callback({
                heroTitle: "SHACO COFFEE CO.",
                heroSubtitle: "Her yudumda Konya'nın ruhu",
                heroBgUrl: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=2000&auto=format&fit=crop",
                features: [
                    { title: "El Yapımı Kahve", desc: "En kaliteli çekirdekler özenle kavrulur ve taptaze sunulur." },
                    { title: "Sadakat Programı", desc: "15 yıldız biriktirin, istediğiniz kahve bizden hediye olsun." },
                    { title: "Hızlı QR Ödeme", point: "Telefonunuzu kasaya göstererek saniyeler içinde ödeyin." },
                    { title: "Özel Çekirdekler", desc: "Dünyanın en seçkin yörelerinden gelen kahve çekirdekleri." }
                ]
            });
        }
    });
};

export const updateSiteConfig = async (newData) => {
    const ref = doc(db, 'siteConfig', 'main');
    const docSnap = await getDoc(ref);
    if (!docSnap.exists()) {
        await setDoc(ref, newData);
    } else {
        await updateDoc(ref, newData);
    }
};
