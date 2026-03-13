// src/components/BranchStatusCard.jsx
// Firestore'daki şube/saat bilgisini çekip açık/kapalı durumunu hesaplar.
// AdminBranches koleksiyonundan veri geldiği varsayılmıştır.
// Eğer koleksiyon adın farklıysa COLLECTION_NAME sabitini güncelle.

import { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs, limit, query } from "firebase/firestore";
import { db } from "../firebase";
import { useTranslation } from "react-i18next";

const COLLECTION_NAME = "settings";
const DOC_ID = "branch"; // Firestore'da settings/branch dökümanı

const DAY_KEYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

function pickFirst(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return null;
}

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

function normalizeTodayHours(branch) {
  const todayIndex = new Date().getDay();
  const todayKey = DAY_KEYS[todayIndex];
  const todayHours = branch?.hours?.[todayKey] || {};

  const openTime = pickFirst(
    todayHours.open,
    todayHours.openTime,
    branch?.openTime,
    branch?.hours?.open,
    branch?.hours?.openTime
  );

  const closeTime = pickFirst(
    todayHours.close,
    todayHours.closeTime,
    branch?.closeTime,
    branch?.hours?.close,
    branch?.hours?.closeTime
  );

  const forcedClosed = Boolean(
    branch?.isClosed ||
      todayHours?.closed ||
      todayHours?.isClosed
  );

  const forcedOpen = branch?.isOpen === true || todayHours?.isOpen === true;

  const open = forcedOpen || (!forcedClosed && isCurrentlyOpen(openTime, closeTime));

  return { todayKey, openTime, closeTime, forcedClosed, open };
}

function normalizeAddressText(address, t) {
  if (!address) return "";
  const value = String(address).trim();
  if (!value) return "";

  // Legacy placeholder values should be localized for active language.
  if (/^(şubenin adresi|subenin adresi|şube adresi|sube adresi)$/i.test(value)) {
    return t("stores.address", { defaultValue: "Address" });
  }

  return value;
}

export default function BranchStatusCard({ isDark = true }) {
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
          return;
        }

        // Fallback: legacy projelerde bilgiler branches koleksiyonunda tutulabiliyor.
        const branchesQuery = query(collection(db, "branches"), limit(1));
        const branchesSnap = await getDocs(branchesQuery);
        if (!branchesSnap.empty) {
          setBranch(branchesSnap.docs[0].data());
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

  const { openTime, closeTime, forcedClosed, open } = normalizeTodayHours(branch);
  const addressText = normalizeAddressText(branch.address, t);

  return (
    <div className={`branch-card ${isDark ? "branch-card--dark" : "branch-card--light"} ${open ? "branch-card--open" : "branch-card--closed"}`}>
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
          {addressText && (
            <span className="branch-card__address">{addressText}</span>
          )}
        </div>
      </div>

      {/* Sağ: Durum + Saat */}
      <div className="branch-card__right">
        <div className={`branch-badge ${open ? "branch-badge--open" : "branch-badge--closed"}`}>
          <span className="branch-badge__dot" />
          <span>{open ? t("branch_card.open_now", { defaultValue: "Open now" }) : t("branch_card.closed_now", { defaultValue: "Closed now" })}</span>
        </div>
        <span className="branch-card__hours">
          {forcedClosed
            ? t("branch_card.closed_today", { defaultValue: "Closed today" })
            : openTime && closeTime
            ? `${openTime} - ${closeTime}`
            : t("branch_card.no_hours", { defaultValue: "Hours unavailable" })}
        </span>
      </div>
    </div>
  );
}
