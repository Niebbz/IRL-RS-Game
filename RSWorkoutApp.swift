import SwiftUI

struct ContentView: View {
  var body: some View {
    TabView {
      NavigationStack {
        SkillsView(skills: SkillProgress.sample)
      }
      .tabItem {
        Label("Skills", systemImage: "square.grid.2x2.fill")
      }

      NavigationStack {
        WorkoutRulesView()
      }
      .tabItem {
        Label("XP Rules", systemImage: "bolt.fill")
      }
    }
  }
}

#Preview {
  ContentView()
}
