import { useEffect, useMemo, useState } from 'react';
import { getApiErrorMessage } from '../api/apiError';
import { authApi } from '../api/authApi';
import { matchCasesApi } from '../api/matchCasesApi';
import { profilesApi } from '../api/profilesApi';
import { SendToShadchanOptions } from '../components/favorites/SendToShadchanDialog';
import { useAuth } from '../contexts/AuthContext';
import { ShadchanSummary } from '../types/account';
import { FullProfile } from '../types/profile';
import { formatAccountName } from '../utils/accountName';
import { getProfileDisplayName } from '../utils/profileDisplay';
import { getShadchanPickerGroups } from '../utils/shadchanAvailability';

type SendResult = { success: true; message: string } | { success: false; message: string };

export function useSendToShadchan() {
  const { currentUser } = useAuth();
  const [targetProfile, setTargetProfile] = useState<FullProfile | null>(null);
  const [linkedShadchanim, setLinkedShadchanim] = useState<ShadchanSummary[]>([]);
  const [allShadchanim, setAllShadchanim] = useState<ShadchanSummary[]>([]);
  const [loadingShadchanim, setLoadingShadchanim] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myProfile, setMyProfile] = useState<FullProfile | null>(null);

  const dialogGroups = useMemo(() => {
    if (!targetProfile) return [];
    return getShadchanPickerGroups(targetProfile, linkedShadchanim, allShadchanim);
  }, [targetProfile, linkedShadchanim, allShadchanim]);

  const senderProfileName = myProfile
    ? getProfileDisplayName(myProfile)
    : formatAccountName(currentUser?.firstName, currentUser?.lastName);

  useEffect(() => {
    let cancelled = false;

    async function loadShadchanData() {
      setLoadingShadchanim(true);
      try {
        const [linked, all] = await Promise.all([
          authApi.getLinkedShadchanim(),
          authApi.getShadchanim(),
        ]);
        if (!cancelled) {
          setLinkedShadchanim(linked);
          setAllShadchanim(all);
        }
      } catch {
        if (!cancelled) {
          setLinkedShadchanim([]);
          setAllShadchanim([]);
        }
      } finally {
        if (!cancelled) setLoadingShadchanim(false);
      }
    }

    loadShadchanData();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!currentUser?.profileId) {
      setMyProfile(null);
      return;
    }

    let cancelled = false;
    profilesApi
      .getById(currentUser.profileId)
      .then((profile) => {
        if (!cancelled) setMyProfile(profile);
      })
      .catch(() => {
        if (!cancelled) setMyProfile(null);
      });

    return () => {
      cancelled = true;
    };
  }, [currentUser?.profileId]);

  const openSendDialog = (profile: FullProfile) => setTargetProfile(profile);
  const closeSendDialog = () => setTargetProfile(null);

  const sendToShadchan = async (options: SendToShadchanOptions): Promise<SendResult> => {
    if (!targetProfile) {
      return { success: false, message: 'לא נבחר פרופיל לשליחה' };
    }

    if (!options.includeMyProfile || !currentUser?.profileId) {
      return {
        success: false,
        message: 'יש לצרף את הפרופיל האישי שלך כדי לפתוח תיק שידוך',
      };
    }

    setIsSubmitting(true);
    try {
      const wasLinked = linkedShadchanim.some(
        (shadchan) => shadchan.accountId === options.shadchanAccountId
      );

      await matchCasesApi.create({
        senderProfileId: currentUser.profileId,
        targetProfileId: targetProfile.id,
        assignedShadchanId: options.shadchanAccountId,
        note: `המלצה: ${targetProfile.firstName} ${targetProfile.lastName}`,
      });

      if (!wasLinked) {
        try {
          await authApi.addLinkedShadchan(options.shadchanAccountId);
          const linked = await authApi.getLinkedShadchanim();
          setLinkedShadchanim(linked);
        } catch {
          // Linking is best-effort; the case was already created.
        }
      }

      setTargetProfile(null);
      return { success: true, message: 'תיק השידוך נפתח ונשלח לשדכן' };
    } catch (error) {
      return { success: false, message: getApiErrorMessage(error) };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isOpen: Boolean(targetProfile),
    targetProfile,
    dialogGroups,
    senderProfileId: currentUser?.profileId ?? null,
    senderProfileName,
    loadingShadchanim,
    isSubmitting,
    openSendDialog,
    closeSendDialog,
    sendToShadchan,
  };
}
