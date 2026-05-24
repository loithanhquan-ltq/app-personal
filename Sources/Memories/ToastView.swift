// ToastView.swift — auto-dismissing notification banner.

import SwiftUI

struct ToastOverlay: View {
  @EnvironmentObject var state: AppState

  var body: some View {
    VStack {
      if let message = state.toast {
        HStack(spacing: 8) {
          Image(systemName: "checkmark.circle.fill")
            .font(.system(size: 13))
            .foregroundStyle(Theme.accent)
          Text(message)
            .font(Theme.sans(13, weight: .medium))
            .foregroundStyle(Theme.ink)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(Theme.card, in: RoundedRectangle(cornerRadius: 10))
        .overlay(RoundedRectangle(cornerRadius: 10).strokeBorder(Theme.rule, lineWidth: 0.5))
        .shadow(color: .black.opacity(0.12), radius: 12, y: 4)
        .transition(.move(edge: .top).combined(with: .opacity))
      }
      Spacer()
    }
    .padding(.top, 12)
    .allowsHitTesting(false)
    .frame(maxWidth: .infinity)
  }
}
