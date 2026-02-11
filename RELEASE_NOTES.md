# Mux Release Notes

## [0.17.2] - 2026-02-11

### ✨ New Features

#### 1. Custom Model Presets
- Full-stack system to save and load model configurations.
- Import/Export presets as JSON for easy sharing.
- Persistent storage for custom model sets.

#### 2. Model Health & Validation
- Automated health check service to ping and validate model endpoints.
- Visual health indicators in the model settings UI.
- Detailed health reports with error diagnostics.

#### 3. Realtime Agent Status Monitor
- Live dashboard in the sidebar showing agent activity.
- Visual streaming metrics (TPS, token counts, elapsed time).
- Session cost tracking and per-model performance breakdown.

---

## [0.17.0] - 2026-02-11

### ✨ New Features

#### 1. Visual Diff Viewer

- Added 3 diff view modes: Inline (traditional), Split (side-by-side), and Unified (merged)
- Keyboard shortcuts for quick mode switching: `Cmd+Shift+1/2/3`
- Persistent view mode preference across sessions
- Enhanced diff rendering with improved readability

#### 2. Workspace Templates

- Template system for quick workspace creation with predefined settings
- 3 built-in templates: Feature Development, Bug Fix, Experimentation
- Import/Export templates as JSON
- Full template management UI (create, edit, delete)
- Persistent storage for custom templates

#### 3. Agent Performance Analytics

- Real-time agent performance metrics dashboard
- Success rate tracking per agent
- Model performance comparison (TTFT, TPS, cost)
- Time-based filtering (All time, 30 days, 7 days)
- Export analytics data as CSV

#### 4. Workspace Favorites

- Pin/unpin workspaces for quick access
- Favorited workspaces auto-sort to top of list
- Cross-tab synchronization
- Persistent favorites across sessions

#### 5. Token Usage Predictor

- Real-time token estimation before sending messages
- Cost prediction in USD
- 3-level warning system (none/high/critical)
- Smart optimization suggestions
- Includes message content, attached files, and context

### 📝 Technical Details

- **Files Added:** 13 new files
  - 4 UI components (TemplateManager, AnalyticsTab, TokenPredictionBanner, DiffViewModeSelector)
  - 2 custom hooks (useWorkspaceTemplates, useWorkspaceFavorites)
  - 6 TypeScript type definitions
  - 4 comprehensive test suites

- **Testing:** 16 unit tests + 12 E2E tests (all passing)
- **Lines Added:** ~1,200 lines of code
- **Storage:** LocalStorage-based persistence for all features

### 🔧 Improvements

- Enhanced DiffRenderer component with view mode support
- Added token prediction utilities
- Improved workspace management workflow
- Better analytics visibility

### 📚 Documentation

- Complete walkthrough documentation
- Integration examples for all new features
- Comprehensive test coverage

---

## [0.16.9] - 2026-02-10

Previous release

