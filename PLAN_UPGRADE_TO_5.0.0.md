# Upgrade Plan: LCWebGL → Best Practices 5.0.0

## Overview
This document outlines the strategy to upgrade LCWebGL from `2.0.0-alpha` to a production-ready `5.0.0` release following modern best practices.

**Current Version:** 2.0.0-alpha  
**Target Version:** 5.0.0  
**Status:** Planning Phase

---

## Major Dependency Upgrades

### Critical Updates (Breaking Changes)

#### 1. Vite (5.4.20 → 7.1.10)
- **Impact:** High - Build tool, potential config changes
- **Strategy:** 
  - Upgrade to Vite 6.x first, test thoroughly
  - Then upgrade to Vite 7.x
  - Review migration guides for each major version
  - Update vite.config.ts as needed
- **Branch:** `upgrade/vite-7`
- **Testing:** Build, dev server, preview, HMR functionality

#### 2. Three.js (0.165.0 → 0.180.0)
- **Impact:** High - Core rendering library
- **Strategy:**
  - Review Three.js changelog for breaking changes
  - Update imports (especially for loaders and controls)
  - Test all scenes and animations
  - Verify KTX2Loader, DRACOLoader compatibility
- **Branch:** `upgrade/three-180`
- **Testing:** All scenes render, loaders work, controls function

#### 3. Vitest (1.6.1 → 3.2.4)
- **Impact:** Medium - Testing infrastructure
- **Strategy:**
  - Review Vitest 2.x and 3.x migration guides
  - Update test configurations
  - Verify all existing tests pass
- **Branch:** `upgrade/vitest-3`
- **Testing:** Run full test suite

#### 4. ESLint (8.57.1 → 9.37.0)
- **Impact:** Medium - Code quality and CI
- **Strategy:**
  - Migrate to ESLint 9 flat config format
  - Update @typescript-eslint plugins to v8
  - Review and fix new rule violations
  - Update CI workflows
- **Branch:** `upgrade/eslint-9`
- **Testing:** Linting passes, no regressions

### Secondary Updates

#### 5. TypeScript Ecosystem
- `@types/node` (20.19.21 → 24.7.2)
- `@typescript-eslint/eslint-plugin` (7.18.0 → 8.46.1)
- `@typescript-eslint/parser` (7.18.0 → 8.46.1)
- **Strategy:** Upgrade alongside ESLint 9 migration

#### 6. Other Dependencies
- `fast-xml-parser` (4.5.3 → 5.3.0)
- `globby` (14.1.0 → 15.0.0)
- `eslint-config-prettier` (9.1.2 → 10.1.8)
- **Strategy:** Upgrade in batches, test data pipeline

---

## Infrastructure Improvements

### Testing Coverage
- [ ] Add unit tests for `scripts/build-data.mjs`
- [ ] Add unit tests for `src/loader/sceneLoader.ts`
- [ ] Add integration tests for scene loading
- [ ] Add UI component tests
- [ ] Setup coverage reporting (target: >80%)

### CI/CD Enhancements
- [ ] Expand CI to run tests automatically
- [ ] Add build preview step
- [ ] Add visual regression testing (optional)
- [ ] Setup automated dependency updates (Dependabot/Renovate)

### Documentation
- [ ] Complete API documentation (TypeDoc)
- [ ] Add architecture diagram
- [ ] Document data pipeline
- [ ] Create troubleshooting guide
- [ ] Write contributor guidelines

### Code Quality
- [ ] Enable strict TypeScript mode
- [ ] Remove any `any` types
- [ ] Add comprehensive JSDoc comments
- [ ] Implement consistent error handling
- [ ] Add logging framework

---

## Upgrade Sequence

### Phase 1: Foundation (2.0.0-alpha → 3.0.0-alpha)
1. Update testing infrastructure (Vitest 3)
2. Add missing tests
3. Setup test coverage reporting
4. Document current architecture

### Phase 2: Build Tools (3.0.0-alpha → 4.0.0-beta)
1. Upgrade Vite to 6.x
2. Test thoroughly
3. Upgrade Vite to 7.x
4. Update build scripts
5. Verify all build outputs

### Phase 3: Core Libraries (4.0.0-beta → 4.0.0-rc)
1. Upgrade Three.js to latest
2. Test all rendering features
3. Upgrade ESLint ecosystem
4. Fix linting issues
5. Update other dependencies

### Phase 4: Polish & Release (4.0.0-rc → 5.0.0)
1. Complete documentation
2. Full QA testing
3. Performance optimization
4. Security audit
5. Final release

---

## Testing Strategy

### Per-Upgrade Testing Checklist
- [ ] `npm install` succeeds
- [ ] `npm run lint` passes
- [ ] `npm run data` succeeds
- [ ] `npm run dev` starts without errors
- [ ] All scenes load correctly
- [ ] UI interactions work
- [ ] `npm run build` succeeds
- [ ] `npm run preview` works
- [ ] No console errors in browser

### Integration Testing
- [ ] Test on Chrome, Firefox, Safari
- [ ] Test on different screen sizes
- [ ] Test with slow network (throttling)
- [ ] Test with legacy assets (if available)

---

## Risk Mitigation

### High-Risk Changes
1. **Vite 7 upgrade** - Could break build configuration
   - Mitigation: Incremental upgrade, comprehensive testing
   
2. **Three.js upgrade** - Could break rendering
   - Mitigation: Test suite for all scenes, visual regression testing

3. **ESLint 9 migration** - Config format change
   - Mitigation: Use migration tool, gradual rule adoption

### Rollback Strategy
- Each upgrade in separate branch
- Tag before each major version bump
- Maintain compatibility with previous major version for one release cycle

---

## Success Criteria

### Version 5.0.0 Requirements
- ✅ All dependencies on latest stable versions
- ✅ >80% test coverage
- ✅ Zero ESLint errors/warnings
- ✅ Complete documentation
- ✅ CI/CD pipeline fully functional
- ✅ Performance benchmarks pass
- ✅ Security audit clean
- ✅ Browser compatibility verified

---

## Timeline Estimate

- **Phase 1:** 2-3 days
- **Phase 2:** 2-3 days  
- **Phase 3:** 3-4 days
- **Phase 4:** 2-3 days

**Total:** ~2 weeks (10-13 days)

---

## Notes

- Keep changes small and focused
- Each upgrade should be in its own PR
- Maintain backwards compatibility where possible
- Document breaking changes clearly
- Update CHANGELOG.md with each version bump

---

*Last Updated: 2025-10-15*  
*Current Status: Planning Complete, Ready to Execute Phase 1*
