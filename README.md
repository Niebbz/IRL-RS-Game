import Foundation

struct SkillProgress: Identifiable {
  let skill: Skill
  var xp: Int

  var id: Skill { skill }
  var level: Int { OSRSLevelTable.level(for: xp) }
  var progress: Double { OSRSLevelTable.progressThroughCurrentLevel(for: xp) }
  var xpRemaining: Int { OSRSLevelTable.xpRemainingForNextLevel(from: xp) }

  static let sample: [SkillProgress] = [
    SkillProgress(skill: .attack, xp: 1_154),
    SkillProgress(skill: .strength, xp: 2_411),
    SkillProgress(skill: .defense, xp: 784),
    SkillProgress(skill: .agility, xp: 300),
    SkillProgress(skill: .discipline, xp: 1_006)
  ]
}
