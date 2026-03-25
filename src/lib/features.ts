/**
 * Premium feature registry and gating helpers.
 *
 * All premium features currently require any non-free plan.
 * The feature parameter is accepted at every call site so individual
 * feature gating can be added later without changing callers.
 */

export const PREMIUM_FEATURES = {
  COMMUNITY_LIBRARY: 'community_library',
  IMPORT_COMMUNITY_CARDS: 'import_community_cards',
} as const

export type PremiumFeature = typeof PREMIUM_FEATURES[keyof typeof PREMIUM_FEATURES]

/** Returns true for any plan that is not 'free'. */
export const isPaidPlan = (planTier: string): boolean => planTier !== 'free'

/** Returns true if the given plan tier can access the requested feature. */
export const canAccessFeature = (
  planTier: string,
  _feature: PremiumFeature
): boolean => isPaidPlan(planTier)

/** Human-readable label for each premium feature (used in Settings UI). */
export const FEATURE_LABELS: Record<PremiumFeature, string> = {
  community_library: 'Browse the Community Library',
  import_community_cards: 'Add community cards to your collection',
}
