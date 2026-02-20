# Component Status Matrix

> 9-dimension status tracking for all Rokkit UI components

## Status Dimensions

| # | Dimension | Description |
|---|-----------|-------------|
| 1 | **Data Attr** | All elements have `data-*` attributes for theming |
| 2 | **Keyboard** | Full keyboard navigation support |
| 3 | **Mouse/Touch** | Mouse and touch interactions work correctly |
| 4 | **ARIA** | Proper ARIA roles, states, properties |
| 5 | **Rokkit** | Styled in Rokkit theme |
| 6 | **Minimal** | Styled in Minimal theme |
| 7 | **Material** | Styled in Material theme |
| 8 | **Mode** | Works in both dark and light modes |
| 9 | **Stories** | Complete tutorial examples |

## Status Indicators

| Icon | Meaning |
|------|---------|
| ✅ | Complete |
| 🟡 | Partial / In Progress |
| ❌ | Missing / Not Started |
| 🚫 | Not Applicable |

---

## @rokkit/ui Components

### Selection Components

#### List
**Package**: @rokkit/ui | **Priority**: High | **llms.txt**: ❌

| Data Attr | Keyboard | Mouse | ARIA | Rokkit | Minimal | Material | Mode | Stories |
|:---------:|:--------:|:-----:|:----:|:------:|:-------:|:--------:|:----:|:-------:|
| 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 |

**Completion**: ~5/9 | **Notes**: Core component, needs audit

---

#### Select
**Package**: @rokkit/ui | **Priority**: High | **llms.txt**: ❌

| Data Attr | Keyboard | Mouse | ARIA | Rokkit | Minimal | Material | Mode | Stories |
|:---------:|:--------:|:-----:|:----:|:------:|:-------:|:--------:|:----:|:-------:|
| 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 |

**Completion**: ~5/9 | **Notes**: Needs comprehensive audit

---

#### MultiSelect
**Package**: @rokkit/ui | **Priority**: Medium | **llms.txt**: ❌

| Data Attr | Keyboard | Mouse | ARIA | Rokkit | Minimal | Material | Mode | Stories |
|:---------:|:--------:|:-----:|:----:|:------:|:-------:|:--------:|:----:|:-------:|
| 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | ❌ |

**Completion**: ~4/9 | **Notes**: Needs stories

---

#### Switch
**Package**: @rokkit/ui | **Priority**: Medium | **llms.txt**: ❌

| Data Attr | Keyboard | Mouse | ARIA | Rokkit | Minimal | Material | Mode | Stories |
|:---------:|:--------:|:-----:|:----:|:------:|:-------:|:--------:|:----:|:-------:|
| 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 |

**Completion**: ~5/9 | **Notes**: Needs audit

---

#### Tabs
**Package**: @rokkit/ui | **Priority**: High | **llms.txt**: ❌

| Data Attr | Keyboard | Mouse | ARIA | Rokkit | Minimal | Material | Mode | Stories |
|:---------:|:--------:|:-----:|:----:|:------:|:-------:|:--------:|:----:|:-------:|
| 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 |

**Completion**: ~5/9 | **Notes**: Needs comprehensive audit

---

#### RadioGroup
**Package**: @rokkit/ui | **Priority**: Medium | **llms.txt**: ❌

| Data Attr | Keyboard | Mouse | ARIA | Rokkit | Minimal | Material | Mode | Stories |
|:---------:|:--------:|:-----:|:----:|:------:|:-------:|:--------:|:----:|:-------:|
| 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | ❌ | ❌ | 🟡 | ❌ |

**Completion**: ~3/9 | **Notes**: Missing theme coverage

---

#### PickOne
**Package**: @rokkit/ui | **Priority**: Low | **llms.txt**: ❌

| Data Attr | Keyboard | Mouse | ARIA | Rokkit | Minimal | Material | Mode | Stories |
|:---------:|:--------:|:-----:|:----:|:------:|:-------:|:--------:|:----:|:-------:|
| 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | ❌ | ❌ | 🟡 | ❌ |

**Completion**: ~3/9 | **Notes**: Low priority

---

### Hierarchical Components

#### Tree
**Package**: @rokkit/ui | **Priority**: High | **llms.txt**: ✅

| Data Attr | Keyboard | Mouse | ARIA | Rokkit | Minimal | Material | Mode | Stories |
|:---------:|:--------:|:-----:|:----:|:------:|:-------:|:--------:|:----:|:-------:|
| 🟡 | ✅ | ✅ | 🟡 | ✅ | 🟡 | 🟡 | ✅ | 🟡 |

**Completion**: ~7/9 | **Notes**: llms.txt exists, needs status verification

---

#### NestedList
**Package**: @rokkit/ui | **Priority**: Medium | **llms.txt**: ❌

| Data Attr | Keyboard | Mouse | ARIA | Rokkit | Minimal | Material | Mode | Stories |
|:---------:|:--------:|:-----:|:----:|:------:|:-------:|:--------:|:----:|:-------:|
| 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | ❌ | ❌ | 🟡 | ❌ |

**Completion**: ~3/9 | **Notes**: Needs work

---

#### Accordion
**Package**: @rokkit/ui | **Priority**: Medium | **llms.txt**: ❌

| Data Attr | Keyboard | Mouse | ARIA | Rokkit | Minimal | Material | Mode | Stories |
|:---------:|:--------:|:-----:|:----:|:------:|:-------:|:--------:|:----:|:-------:|
| 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | ❌ | ❌ | 🟡 | ❌ |

**Completion**: ~3/9 | **Notes**: Needs theme work

---

#### TreeTable
**Package**: @rokkit/ui | **Priority**: Low | **llms.txt**: ❌

| Data Attr | Keyboard | Mouse | ARIA | Rokkit | Minimal | Material | Mode | Stories |
|:---------:|:--------:|:-----:|:----:|:------:|:-------:|:--------:|:----:|:-------:|
| 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | ❌ | ❌ | 🟡 | ❌ |

**Completion**: ~3/9 | **Notes**: Complex component

---

### Form Input Components

#### CheckBox
**Package**: @rokkit/ui | **Priority**: Medium | **llms.txt**: ❌

| Data Attr | Keyboard | Mouse | ARIA | Rokkit | Minimal | Material | Mode | Stories |
|:---------:|:--------:|:-----:|:----:|:------:|:-------:|:--------:|:----:|:-------:|
| 🟡 | ✅ | ✅ | 🟡 | 🟡 | ❌ | ❌ | 🟡 | ❌ |

**Completion**: ~4/9 | **Notes**: Basic functionality complete

---

#### Toggle
**Package**: @rokkit/ui | **Priority**: Medium | **llms.txt**: ❌

| Data Attr | Keyboard | Mouse | ARIA | Rokkit | Minimal | Material | Mode | Stories |
|:---------:|:--------:|:-----:|:----:|:------:|:-------:|:--------:|:----:|:-------:|
| 🟡 | ✅ | ✅ | 🟡 | 🟡 | ❌ | ❌ | 🟡 | ❌ |

**Completion**: ~4/9 | **Notes**: Basic functionality complete

---

#### Range
**Package**: @rokkit/ui | **Priority**: Medium | **llms.txt**: ❌

| Data Attr | Keyboard | Mouse | ARIA | Rokkit | Minimal | Material | Mode | Stories |
|:---------:|:--------:|:-----:|:----:|:------:|:-------:|:--------:|:----:|:-------:|
| 🟡 | 🟡 | ✅ | 🟡 | 🟡 | ❌ | ❌ | 🟡 | ❌ |

**Completion**: ~3/9 | **Notes**: Needs keyboard support audit

---

#### Rating
**Package**: @rokkit/ui | **Priority**: Low | **llms.txt**: ❌

| Data Attr | Keyboard | Mouse | ARIA | Rokkit | Minimal | Material | Mode | Stories |
|:---------:|:--------:|:-----:|:----:|:------:|:-------:|:--------:|:----:|:-------:|
| 🟡 | 🟡 | ✅ | 🟡 | 🟡 | ❌ | ❌ | 🟡 | ❌ |

**Completion**: ~3/9 | **Notes**: Custom implementation

---

### Layout Components

#### Card
**Package**: @rokkit/ui | **Priority**: Medium | **llms.txt**: ❌

| Data Attr | Keyboard | Mouse | ARIA | Rokkit | Minimal | Material | Mode | Stories |
|:---------:|:--------:|:-----:|:----:|:------:|:-------:|:--------:|:----:|:-------:|
| 🟡 | 🚫 | 🚫 | 🚫 | 🟡 | 🟡 | 🟡 | 🟡 | ❌ |

**Completion**: ~4/9 | **Notes**: Presentational component

---

#### ResponsiveGrid
**Package**: @rokkit/ui | **Priority**: Medium | **llms.txt**: ❌

| Data Attr | Keyboard | Mouse | ARIA | Rokkit | Minimal | Material | Mode | Stories |
|:---------:|:--------:|:-----:|:----:|:------:|:-------:|:--------:|:----:|:-------:|
| 🟡 | 🚫 | 🚫 | 🚫 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 |

**Completion**: ~5/9 | **Notes**: Has some stories

---

### Navigation Components

#### BreadCrumbs
**Package**: @rokkit/ui | **Priority**: Medium | **llms.txt**: ❌

| Data Attr | Keyboard | Mouse | ARIA | Rokkit | Minimal | Material | Mode | Stories |
|:---------:|:--------:|:-----:|:----:|:------:|:-------:|:--------:|:----:|:-------:|
| 🟡 | 🟡 | ✅ | 🟡 | 🟡 | ❌ | ❌ | 🟡 | ❌ |

**Completion**: ~3/9 | **Notes**: Needs ARIA audit

---

#### DropDown
**Package**: @rokkit/ui | **Priority**: Medium | **llms.txt**: ❌

| Data Attr | Keyboard | Mouse | ARIA | Rokkit | Minimal | Material | Mode | Stories |
|:---------:|:--------:|:-----:|:----:|:------:|:-------:|:--------:|:----:|:-------:|
| 🟡 | 🟡 | ✅ | 🟡 | 🟡 | ❌ | ❌ | 🟡 | ❌ |

**Completion**: ~3/9 | **Notes**: Needs keyboard support

---

#### Stepper
**Package**: @rokkit/ui | **Priority**: Medium | **llms.txt**: ❌

| Data Attr | Keyboard | Mouse | ARIA | Rokkit | Minimal | Material | Mode | Stories |
|:---------:|:--------:|:-----:|:----:|:------:|:-------:|:--------:|:----:|:-------:|
| 🟡 | 🚫 | ✅ | 🟡 | 🟡 | ❌ | ❌ | 🟡 | ❌ |

**Completion**: ~3/9 | **Notes**: Display component

---

### Feedback Components

#### ProgressBar
**Package**: @rokkit/ui | **Priority**: Medium | **llms.txt**: ❌

| Data Attr | Keyboard | Mouse | ARIA | Rokkit | Minimal | Material | Mode | Stories |
|:---------:|:--------:|:-----:|:----:|:------:|:-------:|:--------:|:----:|:-------:|
| 🟡 | 🚫 | 🚫 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | ❌ |

**Completion**: ~4/9 | **Notes**: Display component

---

#### ValidationReport
**Package**: @rokkit/ui | **Priority**: Medium | **llms.txt**: ❌

| Data Attr | Keyboard | Mouse | ARIA | Rokkit | Minimal | Material | Mode | Stories |
|:---------:|:--------:|:-----:|:----:|:------:|:-------:|:--------:|:----:|:-------:|
| 🟡 | 🚫 | 🚫 | 🟡 | 🟡 | ❌ | ❌ | 🟡 | 🟡 |

**Completion**: ~4/9 | **Notes**: Has some stories

---

### Display Components

#### Button
**Package**: @rokkit/ui | **Priority**: High | **llms.txt**: ❌

| Data Attr | Keyboard | Mouse | ARIA | Rokkit | Minimal | Material | Mode | Stories |
|:---------:|:--------:|:-----:|:----:|:------:|:-------:|:--------:|:----:|:-------:|
| 🟡 | ✅ | ✅ | ✅ | 🟡 | 🟡 | 🟡 | 🟡 | ❌ |

**Completion**: ~6/9 | **Notes**: Core component

---

#### Icon
**Package**: @rokkit/ui | **Priority**: High | **llms.txt**: ❌

| Data Attr | Keyboard | Mouse | ARIA | Rokkit | Minimal | Material | Mode | Stories |
|:---------:|:--------:|:-----:|:----:|:------:|:-------:|:--------:|:----:|:-------:|
| 🟡 | 🚫 | 🚫 | 🟡 | ✅ | ✅ | ✅ | ✅ | ❌ |

**Completion**: ~6/9 | **Notes**: Well supported

---

#### Item
**Package**: @rokkit/ui | **Priority**: Medium | **llms.txt**: ❌

| Data Attr | Keyboard | Mouse | ARIA | Rokkit | Minimal | Material | Mode | Stories |
|:---------:|:--------:|:-----:|:----:|:------:|:-------:|:--------:|:----:|:-------:|
| 🟡 | 🚫 | 🚫 | 🚫 | 🟡 | 🟡 | 🟡 | 🟡 | ❌ |

**Completion**: ~4/9 | **Notes**: Internal rendering component

---

## @rokkit/composables Components

#### List (composables)
**Package**: @rokkit/composables | **Priority**: High | **llms.txt**: ❌

| Data Attr | Keyboard | Mouse | ARIA | Rokkit | Minimal | Material | Mode | Stories |
|:---------:|:--------:|:-----:|:----:|:------:|:-------:|:--------:|:----:|:-------:|
| ✅ | ✅ | ✅ | ✅ | 🟡 | ❌ | ❌ | 🟡 | ❌ |

**Completion**: ~5/9 | **Notes**: bits-ui foundation provides a11y

---

#### Tree (composables)
**Package**: @rokkit/composables | **Priority**: High | **llms.txt**: ❌

| Data Attr | Keyboard | Mouse | ARIA | Rokkit | Minimal | Material | Mode | Stories |
|:---------:|:--------:|:-----:|:----:|:------:|:-------:|:--------:|:----:|:-------:|
| ✅ | ✅ | ✅ | ✅ | 🟡 | ❌ | ❌ | 🟡 | ❌ |

**Completion**: ~5/9 | **Notes**: bits-ui provides a11y

---

## @rokkit/forms Components

#### FormRenderer
**Package**: @rokkit/forms | **Priority**: High | **llms.txt**: ✅ (in forms)

| Data Attr | Keyboard | Mouse | ARIA | Rokkit | Minimal | Material | Mode | Stories |
|:---------:|:--------:|:-----:|:----:|:------:|:-------:|:--------:|:----:|:-------:|
| 🟡 | 🟡 | ✅ | 🟡 | 🟡 | ❌ | ❌ | 🟡 | 🟡 |

**Completion**: ~4/9 | **Notes**: Documented in forms llms.txt

---

#### InputField
**Package**: @rokkit/forms | **Priority**: High | **llms.txt**: ✅ (in forms)

| Data Attr | Keyboard | Mouse | ARIA | Rokkit | Minimal | Material | Mode | Stories |
|:---------:|:--------:|:-----:|:----:|:------:|:-------:|:--------:|:----:|:-------:|
| ✅ | ✅ | ✅ | 🟡 | ✅ | ❌ | ❌ | ✅ | 🟡 |

**Completion**: ~6/9 | **Notes**: Recently updated styles

---

## Summary Statistics

### By Package

| Package | Components | Avg Completion | llms.txt |
|---------|------------|----------------|----------|
| @rokkit/ui | 57 | ~40% | 1/57 |
| @rokkit/composables | 7 | ~50% | 0/7 |
| @rokkit/forms | 8 | ~50% | 1/8 |

### By Dimension (Estimated)

| Dimension | Complete | Partial | Missing |
|-----------|----------|---------|---------|
| Data Attributes | 5% | 80% | 15% |
| Keyboard | 20% | 60% | 20% |
| Mouse/Touch | 40% | 50% | 10% |
| ARIA | 10% | 70% | 20% |
| Rokkit Theme | 30% | 60% | 10% |
| Minimal Theme | 5% | 20% | 75% |
| Material Theme | 5% | 20% | 75% |
| Dark/Light Mode | 30% | 60% | 10% |
| Stories | 10% | 30% | 60% |

### Priority Distribution

| Priority | Count | With llms.txt |
|----------|-------|---------------|
| High | 12 | 2 |
| Medium | 28 | 0 |
| Low | 32 | 0 |

---

## Next Steps

1. Audit high-priority components and update status
2. Create llms.txt for high-priority components
3. Address theme coverage gaps (Minimal, Material)
4. Add stories for undocumented components
5. Complete ARIA audit across all components
