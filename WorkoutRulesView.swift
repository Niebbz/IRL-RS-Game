import Foundation

enum OSRSLevelTable {
  static let maxLevel = 99

  static func xpForLevel(_ level: Int) -> Int {
    guard level > 1 else { return 0 }

    let cappedLevel = min(level, maxLevel)
    var points = 0

    for currentLevel in 1..<cappedLevel {
      let levelPoints = Double(currentLevel) + 300.0 * pow(2.0, Double(currentLevel) / 7.0)
      points += Int(levelPoints.rounded(.down))
    }

    return points / 4
  }

  static func level(for xp: Int) -> Int {
    let safeXP = max(0, xp)
    var level = 1

    for candidateLevel in 2...maxLevel {
      if safeXP >= xpForLevel(candidateLevel) {
        level = candidateLevel
      } else {
        break
      }
    }

    return level
  }

  static func xpForNextLevel(from xp: Int) -> Int? {
    let currentLevel = level(for: xp)
    guard currentLevel < maxLevel else { return nil }
    return xpForLevel(currentLevel + 1)
  }

  static func progressThroughCurrentLevel(for xp: Int) -> Double {
    let currentLevel = level(for: xp)
    guard currentLevel < maxLevel else { return 1.0 }

    let currentLevelXP = xpForLevel(currentLevel)
    let nextLevelXP = xpForLevel(currentLevel + 1)
    let levelSpan = nextLevelXP - currentLevelXP

    guard levelSpan > 0 else { return 0.0 }
    return Double(xp - currentLevelXP) / Double(levelSpan)
  }

  static func xpRemainingForNextLevel(from xp: Int) -> Int {
    guard let nextLevelXP = xpForNextLevel(from: xp) else { return 0 }
    return max(0, nextLevelXP - xp)
  }
}
