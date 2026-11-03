export const BALANCE = Object.freeze({
  attackCombo: .2, healCombo: .05, growthCombo: .2,
  bossShieldRegen: 1, specialChance: .15,
  lootRarity: Object.freeze({Common:.50,Uncommon:.30,Rare:.15,Epic:.05}),
  bonusLootRarity: Object.freeze({Rare:.90,Epic:.10}),
  captureNormal: 1 - Math.cbrt(.1), captureBoss: 1 - Math.cbrt(.6),
  wildEvolutionStart: 31, wildEvolutionMaxChance: .45,
  inheritance: 'reset-stats-keep-appearance', recentQuestions: 8,
  encounterHpBase: 3, encounterHpPerStage: .28, bossHpMultiplier: 2,
  captureHealHp: true, evolutionPriority: ['hp','attack','shield'],
  reviewWeights: [.8, .7, .65, .6, .55],
});
export const budgetAt = stage => 14 + .33 * (stage - 1) + .0018 * (stage - 1) ** 2;
