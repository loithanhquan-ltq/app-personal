import SwiftUI

struct TokenSetupView: View {
  @EnvironmentObject var state: AppState
  @Environment(\.dismiss) private var dismiss

  @State private var token     = ""
  @State private var isLoading = false
  @State private var errorMsg: String? = nil

  var body: some View {
    VStack(spacing: 0) {
      // Header
      HStack {
        Button("Cancel") { dismiss() }
          .font(Theme.sans(13))
          .foregroundStyle(Theme.ink2)
          .buttonStyle(.plain)
        Spacer()
        Text("Connect GitHub")
          .font(Theme.serif(17, weight: .medium))
          .foregroundStyle(Theme.ink)
        Spacer()
        Button(action: connect) {
          HStack(spacing: 5) {
            if isLoading { ProgressView().controlSize(.mini).tint(.white) }
            Text(isLoading ? "Verifying…" : "Connect")
              .font(Theme.sans(13, weight: .semibold))
          }
          .foregroundStyle(.white)
          .padding(.horizontal, 14).padding(.vertical, 5)
          .background(token.isEmpty || isLoading ? Theme.accent.opacity(0.4) : Theme.accent,
                      in: RoundedRectangle(cornerRadius: 7))
        }
        .buttonStyle(.plain)
        .disabled(token.isEmpty || isLoading)
      }
      .padding(.horizontal, 24).padding(.vertical, 16)
      .overlay(alignment: .bottom) { Rectangle().fill(Theme.rule).frame(height: 0.5) }

      // Body
      VStack(alignment: .leading, spacing: 20) {
        VStack(alignment: .leading, spacing: 8) {
          Text("GITHUB TOKEN".uppercased())
            .font(Theme.mono(10, weight: .medium))
            .tracking(1.2)
            .foregroundStyle(Theme.ink3)

          SecureField("ghp_••••••••••••••••••••••••••••••••••••••", text: $token)
            .textFieldStyle(.plain)
            .font(.system(.body, design: .monospaced))
            .foregroundStyle(Theme.ink)
            .padding(.horizontal, 12).padding(.vertical, 9)
            .background(Theme.bg, in: RoundedRectangle(cornerRadius: 8))
            .overlay(RoundedRectangle(cornerRadius: 8).strokeBorder(Theme.rule, lineWidth: 0.8))
            .onSubmit { connect() }

          Text("Generate at **github.com/settings/tokens** → New token (classic) → tick **repo** scope (needed to write files to the photos folder).")
            .font(Theme.serif(12.5, italic: true))
            .foregroundStyle(Theme.ink3)
            .lineSpacing(3)
        }

        if let err = errorMsg {
          Text(err)
            .font(Theme.sans(12))
            .foregroundStyle(.red.opacity(0.8))
        }

        Divider()

        VStack(alignment: .leading, spacing: 6) {
          Text("HOW IT WORKS".uppercased())
            .font(Theme.mono(10, weight: .medium))
            .tracking(1.2)
            .foregroundStyle(Theme.ink3)
          VStack(alignment: .leading, spacing: 4) {
            row("When you drop a photo, it's uploaded to the repo's assets/photos/ folder.")
            row("Your partner needs no token — photos load automatically for everyone.")
            row("Photos persist across updates — they live in the repo, not just the app.")
          }
        }
      }
      .padding(24)
      .frame(maxWidth: .infinity, alignment: .leading)
    }
    .background(Theme.bg)
    .frame(width: 480)
    .fixedSize(horizontal: false, vertical: true)
    .preferredColorScheme(.light)
  }

  @ViewBuilder
  private func row(_ text: String) -> some View {
    HStack(alignment: .top, spacing: 8) {
      Text("·").foregroundStyle(Theme.accent).font(Theme.sans(14, weight: .bold))
      Text(text).font(Theme.serif(13)).foregroundStyle(Theme.ink2).lineSpacing(2)
    }
  }

  private func connect() {
    guard !token.isEmpty, !isLoading else { return }
    isLoading = true
    errorMsg = nil
    Task {
      do {
        try await GitHubPhotosService().validate(token: token)
        await state.setGithubToken(token)
        dismiss()
      } catch {
        errorMsg = error.localizedDescription
        isLoading = false
      }
    }
  }
}
