import React from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context';
import { Header, Badge } from '../../components';
import { useAchievements } from '../../hooks';
import styles from '../../styles/screens/Achievements.styles';
import theme from '../../styles/theme';
import { 
  Crown, Zap, Wind, Moon, Send, Globe, Shield, FastForward, Sun, Map,
  Lock, CheckCircle2, Gift, Clipboard, Award, ShieldAlert, Share2 
} from 'lucide-react-native';

const TIER_DATA = [
  { tier: 1, label: 'Pasaporte Cósmico', icon: Map, color: '#3b82f6', pts: 0, phase: 'GANCHO', reward: 'Sin cargos de servicio' },
  { tier: 2, label: 'Ignición: T-Minus 0', icon: Zap, color: '#22c55e', pts: 100, phase: 'GANCHO', reward: '15% de Descuento' },
  { tier: 3, label: 'Órbita Baja', icon: Wind, color: '#06b6d4', pts: 300, phase: 'GANCHO', reward: '25% de Descuento' },
  { tier: 4, label: 'Alunizaje VIP', icon: Moon, color: '#8b5cf6', pts: 500, phase: 'RETENCIÓN', reward: 'Acceso Preferencial' },
  { tier: 5, label: 'Piloto Sputnik', icon: Send, color: '#ec4899', pts: 1000, phase: 'RETENCIÓN', reward: 'Regalo Oficial' },
  { tier: 6, label: 'Viajero de Marte', icon: Globe, color: '#f59e0b', pts: 2000, phase: 'RETENCIÓN', reward: 'Sorteo Conocer Artista' },
  { tier: 7, label: 'Comandante Interestelar', icon: Shield, color: '#ef4444', pts: 5000, phase: 'FIDELIZACIÓN', reward: 'Preventa Exclusiva' },
  { tier: 8, label: 'Salto al Hiperespacio', icon: FastForward, color: '#10b981', pts: 7500, phase: 'FIDELIZACIÓN', reward: 'Prueba de Sonido' },
  { tier: 9, label: 'Supernova', icon: Sun, color: '#a855f7', pts: 9000, phase: 'FIDELIZACIÓN', reward: 'Paquete Hospitalidad' },
  { tier: 10, label: 'El Legado Laika', icon: Crown, color: '#eab308', pts: 10000, phase: 'LEYENDA', reward: 'MEMBRESÍA VITALICIA' },
];

function getTier(pts) {
  let t = TIER_DATA[0];
  for (const td of TIER_DATA) {
    if (pts >= td.pts) t = td;
  }
  return t;
}

function getNextTier(pts) {
  return TIER_DATA.find(td => td.pts > pts) || null;
}

export const AchievementsScreen = ({ navigation }) => {
  const { isAuthenticated } = useAuth();
  const { data, coupons, loading, error, refresh, runCheck } = useAchievements();

  const handleShareCoupon = async (coupon) => {
    try {
      await Share.share({
        message: `¡Usa mi cupón de Laika Club! Código: ${coupon.code} (${coupon.description || 'Descuento especial'}).`,
        title: 'Compartir Cupón Laika',
      });
    } catch (err) {
      console.warn('Error sharing coupon:', err);
    }
  };

  const onRefresh = () => {
    refresh();
  };

  if (!isAuthenticated()) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header showBack />
        <View style={styles.center}>
          <Award size={64} color={theme.colors.gray400} style={{ marginBottom: 16 }} />
          <Text style={{ fontSize: 20, fontWeight: theme.typography.fontBlack, color: theme.colors.black, marginBottom: 8 }}>
            Tus Logros Cósmicos
          </Text>
          <Text style={{ fontSize: 13, color: theme.colors.gray600, textAlign: 'center', lineHeight: 18, marginBottom: 24, paddingHorizontal: 32 }}>
            Inicia sesión para ver tu nivel de lealtad, reclamar tus cupones de descuento y desbloquear recompensas exclusivas.
          </Text>
          <TouchableOpacity
            style={{ paddingVertical: 10, paddingHorizontal: 20, backgroundColor: theme.colors.black, borderRadius: theme.radii.sm }}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={{ color: theme.colors.white, fontSize: 10, fontWeight: theme.typography.fontBlack, letterSpacing: 1.5 }}>INICIAR SESIÓN</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header showBack />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.black} />
          <Text style={styles.loadingText}>Escaneando tus logros cósmicos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const points = data?.total_points || 0;
  const currentTier = getTier(points);
  const nextTier = getNextTier(points);
  const ptsToNext = nextTier ? nextTier.pts - points : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header showBack />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} colors={[theme.colors.black]} />
        }
      >
        {/* 1. HERO CARD COMPACT */}
        <View style={styles.heroCard}>
          <View style={styles.heroLeft}>
            <Text style={styles.heroBrand}>LAIKA CLUB</Text>
            <View style={styles.heroStatusRow}>
              <Text style={styles.heroStatusLabel}>Estatus actual: </Text>
              <Text style={[styles.heroStatusVal, { color: currentTier.color }]}>
                {currentTier.label}
              </Text>
            </View>
          </View>

          <View style={styles.heroRight}>
            <View style={styles.heroTextRight}>
              <Text style={styles.heroXp}>{points} XP</Text>
              {nextTier && (
                <Text style={styles.heroNextXp}>-{ptsToNext} XP para el siguiente</Text>
              )}
            </View>
            <View style={[styles.heroIconBox, { backgroundColor: `${currentTier.color}20`, borderColor: currentTier.color }]}>
              {React.createElement(currentTier.icon, { size: 20, color: currentTier.color })}
            </View>
          </View>
        </View>

        {/* 2. PHASES AND PROGRESSION */}
        {['GANCHO', 'RETENCIÓN', 'FIDELIZACIÓN', 'LEYENDA'].map((phaseName, phaseIdx) => {
          const phaseTiers = TIER_DATA.filter(t => t.phase === phaseName);
          const phaseProgress = phaseTiers.filter(t => points >= t.pts).length;
          const totalInPhase = phaseTiers.length;

          return (
            <View key={phaseName} style={styles.phaseSection}>
              <View style={styles.phaseHeader}>
                <View style={styles.phaseTitleBox}>
                  <Text style={styles.phaseNum}>0{phaseIdx + 1}</Text>
                  <Text style={styles.phaseTitle}>{phaseName}</Text>
                </View>
                <View style={styles.phaseProgressRow}>
                  <Text style={styles.phaseProgressText}>{phaseProgress}/{totalInPhase}</Text>
                  <View style={styles.phaseProgressBarBg}>
                    <View style={[styles.phaseProgressBarFg, { width: `${(phaseProgress / totalInPhase) * 100}%` }]} />
                  </View>
                </View>
              </View>

              {/* Achievement Grid/List */}
              {phaseTiers.map(t => {
                const isUnlocked = points >= t.pts;
                const tierProgress = t.pts === 0 ? 100 : Math.min(100, (points / t.pts) * 100);

                return (
                  <View key={t.tier} style={[styles.achCard, isUnlocked ? { borderColor: `${t.color}40` } : { borderColor: 'rgba(0,0,0,0.05)' }]}>
                    <View style={styles.achCardLeft}>
                      <View style={[styles.achIconBox, { backgroundColor: `${t.color}15`, borderColor: `${t.color}25` }]}>
                        {React.createElement(t.icon, { size: 22, color: t.color })}
                      </View>
                      <Text style={[styles.achLevelText, { color: t.color }]}>NIVEL {t.tier}</Text>
                    </View>

                    <View style={styles.achCardMiddle}>
                      <View style={styles.achTitleRow}>
                        <Text style={styles.achTitle}>{t.label}</Text>
                        <Text style={[styles.achPercent, { color: t.color }]}>
                          {Math.floor(tierProgress)}%
                        </Text>
                      </View>

                      <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFg, { width: `${tierProgress}%`, backgroundColor: t.color }]} />
                      </View>

                      <Text style={styles.achDesc}>
                        {t.pts === 0
                          ? 'Para desbloquear este nivel solo necesitas registrarte en LAIKA.'
                          : `Para desbloquear este nivel necesitas ir o asistir a ${t.pts / 100} eventos.`}
                      </Text>
                    </View>

                    <View style={styles.achCardRight}>
                      {isUnlocked ? (
                        <View style={[styles.unlockedBadge, { backgroundColor: `${t.color}10`, borderColor: `${t.color}20` }]}>
                          <CheckCircle2 size={12} color={t.color} />
                          <Text style={[styles.unlockedText, { color: t.color }]}>LOGRADO</Text>
                        </View>
                      ) : (
                        <View style={styles.lockedBadge}>
                          <Lock size={12} color={theme.colors.gray400} />
                          <Text style={styles.lockedText}>CERRADO</Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          );
        })}

        {/* 3. BENEFITS & COUPONS */}
        <View style={styles.benefitsSection}>
          <Text style={styles.sectionTitle}>Tus Beneficios y Descuentos</Text>

          <View style={styles.couponGrid}>
            {/* Level Rewards (Permanent benefits) */}
            {TIER_DATA.filter(t => points >= t.pts && t.reward).map((t, idx) => (
              <View key={`reward-${idx}`} style={[styles.couponCard, { borderColor: t.color }]}>
                <View style={styles.couponMain}>
                  <View style={styles.couponHeaderRow}>
                    <Gift size={14} color={t.color} />
                    <Text style={[styles.couponHeaderLabel, { color: t.color }]}>RECOMPENSA DE NIVEL {t.tier}</Text>
                  </View>
                  <Text style={styles.couponTitle}>{t.reward}</Text>
                  <Text style={styles.couponDesc}>Obtenido por alcanzar el rango {t.label}</Text>
                </View>
                <View style={styles.couponFooter}>
                  <Text style={[styles.couponFooterLeft, { color: t.color }]}>✓ BENEFICIO ACTIVO</Text>
                  <Text style={styles.couponFooterRight}>PERMANENTE</Text>
                </View>
              </View>
            ))}

            {/* Coupons from backend */}
            {coupons.map((c, idx) => (
              <View key={`coupon-${idx}`} style={[styles.couponCard, { borderColor: theme.colors.gray300 }]}>
                <View style={styles.couponMain}>
                  <Text style={styles.couponTitle}>{c.description || 'CUPÓN ESPECIAL'}</Text>
                  
                  <View style={styles.codeRow}>
                    <Text style={styles.codeVal}>{c.code}</Text>
                    <TouchableOpacity
                      style={styles.copyBtn}
                      onPress={() => handleShareCoupon(c)}
                    >
                      <Share2 size={14} color={theme.colors.white} />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.couponFooter}>
                  <Text style={[styles.couponFooterLeft, { color: theme.colors.gray500 }]}>
                    {c.expires_at ? `EXPIRA: ${new Date(c.expires_at).toLocaleDateString()}` : 'CUPÓN PERMANENTE'}
                  </Text>
                  <Text style={styles.couponFooterRight}>DISPONIBLE</Text>
                </View>
              </View>
            ))}

            {/* Empty benefits state */}
            {TIER_DATA.filter(t => points >= t.pts && t.reward).length === 0 && coupons.length === 0 && (
              <View style={styles.noBenefitsCard}>
                <Gift size={32} color={theme.colors.gray400} />
                <Text style={styles.noBenefitsTitle}>Ninguna recompensa activa</Text>
                <Text style={styles.noBenefitsSub}>
                  Sigue asistiendo a eventos de Laika para desbloquear cupones y membresías exclusivas.
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AchievementsScreen;
