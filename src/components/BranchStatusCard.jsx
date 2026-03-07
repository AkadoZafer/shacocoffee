// src/components/BranchStatusCard.jsx
// Firestore'daki şube/saat bilgisini çekip açık/kapalı durumunu hesaplar.
// AdminBranches koleksiyonundan veri geldiği varsayılmıştır.
// Eğer koleksiyon adın farklıysa COLLECTION_NAME sabitini güncelle.

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useTranslation } from "react-i18next";

const COLLECTION_NAME = "settings";
const DOC_ID = "branch"; // Firestore'da settings/branch dökümanı

// Türkçe gün adları → İngilizce key mapping
const DAY_KEYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const DAY_LABELS_TR = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

/**
 * "09:00" formatındaki string'i dakikaya çevirir
 */
function timeToMinutes(timeStr) {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

/**
 * Şu anki saat aralığını kontrol eder
 * open: "09:00", close: "22:00"
 */
function isCurrentlyOpen(openTime, closeTime) {
  if (!openTime || !closeTime) return false;
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMin = timeToMinutes(openTime);
  const closeMin = timeToMinutes(closeTime);

  // Gece yarısı geçen vardiyalar (örn. 22:00 - 02:00)
  if (closeMin < openMin) {
    return currentMinutes >= openMin || currentMinutes < closeMin;
  }
  return currentMinutes >= openMin && currentMinutes < closeMin;
}

export default function BranchStatusCard() {
  const [branch, setBranch] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchBranch = async () => {
      try {
        const ref = doc(db, COLLECTION_NAME, DOC_ID);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setBranch(snap.data());
        }
      } catch (err) {
        console.warn("Şube bilgisi alınamadı:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBranch();
  }, []);

  if (loading) {
    return (
      <div className="branch-card branch-card--skeleton" aria-hidden="true">
        <div className="branch-skeleton-line" style={{ width: "40%" }} />
        <div className="branch-skeleton-line" style={{ width: "65%" }} />
      </div>
    );
  }

  if (!branch) return null;

  const todayIndex = new Date().getDay();
  const todayKey = DAY_KEYS[todayIndex];
  const todayLabel = DAY_LABELS_TR[todayIndex];
  const todayHours = branch.hours?.[todayKey];
  const isClosed = branch.isClosed || todayHours?.closed;
  const openTime = todayHours?.open;
  const closeTime = todayHours?.close;
  const open = !isClosed && isCurrentlyOpen(openTime, closeTime);

  return (
    <div className={`branch-card ${open ? "branch-card--open" : "branch-card--closed"}`}>
      {/* Sol: İkon + Şube Adı */}
      <div className="branch-card__left">
        <div className="branch-card__icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </div>
        <div className="branch-card__info">
          <span className="branch-card__name">{branch.name || "Shaco Coffee"}</span>
          {branch.address && (
            <span className="branch-card__address">{branch.address}</span>
          )}
        </div>
      </div>

      {/* Sağ: Durum + Saat */}
      <div className="branch-card__right">
        <div className={`branch-badge ${open ? "branch-badge--open" : "branch-badge--closed"}`}>
          <span className="branch-badge__dot" />
          <span>{open ? t('branch_card.open_now') : t('branch_card.closed_now')}</span>
        </div>
        <span className="branch-card__hours">
          {isClosed
            ? t('branch_card.closed_today')
            : openTime && closeTime
            ? `${todayLabel} ${openTime} – ${closeTime}`
            : t('branch_card.no_hours')}
        </span>
      </div>
    </div>
  );
}
