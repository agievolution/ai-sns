# KM Notes Loading & Editor Height Fix

## 🔍 Issues Fixed

### Issue 1: Notes Not Loading
**Problem**: Backend has 68 notes but frontend shows empty list

### Issue 2: Editor Height Too Small
**Problem**: Editor content area not expanding to fill available space

---

## ✅ Root Causes & Solutions

### Issue 1: Notes Not Loading

#### Root Cause: Multiple Type Mismatches

**Problem 1: API Parameter Type Mismatch**
- Frontend was passing numeric `kbId` (e.g., 4) to API
- But database `note_mng.km_id` column stores strings (e.g., "note_store")
- API was filtering by numeric ID, finding no matches

**Problem 2: Wrong API Endpoint**
- Frontend called `/api/km/notes?km_id=${kbId}` (doesn't exist)
- Correct endpoint is `/api/km/notes/search?km_id=${kmId}`

**Problem 3: Route Ordering Issue**
- FastAPI was matching `/notes/search` against `/notes/{note_id}` route
- Dynamic routes must come AFTER specific routes

#### Solution: Pass String km_id Instead of Numeric ID

**Database Structure:**
```sql
-- km_cfg table
id (INTEGER)    | km_id (STRING)     | name        | kmtype
4               | "note_store"       | "My Note"   | 1

-- note_mng table
id (INTEGER)    | km_id (STRING)     | title       | content
189             | "note_store"       | "amazon"    | "..."
229             | "note_store"       | "ai coding" | "..."
```

**Fixed Flow:**
```
1. Frontend gets KB list from API → includes both id=4 and km_id="note_store"
2. Store both values in DOM: data-kb-id="4" data-km-id="note_store"
3. On KB click, pass both to event: { kbId: 4, kmId: "note_store", kbType: 1 }
4. API call uses string: /api/km/notes/search?km_id=note_store
5. Database filter: NoteMng.km_id == "note_store" ✅ Matches!
6. Returns 65 notes
```

---

### Issue 2: Editor Height Too Small

#### Root Cause: Missing Container CSS

**Problem:**
- `#km-main-content` container had no height styling
- Without explicit height, flex children can't expand properly
- Editor content area couldn't fill available space

#### Solution: Add Container Height CSS

**CSS Hierarchy:**
```css
.km-main-content-wrapper {
    height: 100%;              /* Fill parent */
    display: flex;
    flex-direction: column;
}

.km-page-layout {
    height: 100%;              /* Fill wrapper */
    display: flex;
    flex-direction: column;
}

.km-editor-content {
    flex: 1;                   /* Expand to fill available space */
    overflow-y: auto;
}
```

---

## 📝 Files Modified

### Frontend Changes

#### 1. `renderer/js/modules/km/KMSidebar.js`
**Added `data-km-id` attributes to DOM elements:**

```javascript
// Line 86: KB list item
<div class="km-item" data-kb-id="${kb.id}" data-km-id="${kb.km_id}" data-kb-type="${kb.kmtype}">

// Line 94: KB section container
<div class="km-section-container" data-kb-id="${kb.id}" data-km-id="${kb.km_id}">

// Line 150: Note section
<div class="km-user-section" data-kb-id="${kb.id}" data-km-id="${kb.km_id}">

// Line 153: New Note button
<button class="km-action-btn" data-action="new-note" data-kb-id="${kb.id}" data-km-id="${kb.km_id}">

// Line 190: Note tree
<div class="km-note-tree" id="noteTree-${kb.id}" data-km-id="${kb.km_id}">
```

**Updated switchKb to pass kmId in event:**

```javascript
// Line 426-434
const kbItem = document.querySelector(`#kmList .km-item[data-kb-id="${kbId}"]`);
const kbType = kbItem ? parseInt(kbItem.dataset.kbType) : null;
const kmId = kbItem ? kbItem.dataset.kmId : null;  // ✅ Get string km_id

window.dispatchEvent(new CustomEvent('km-switched', {
    detail: { kbId, kmId, kbType }  // ✅ Pass kmId
}));
```

#### 2. `renderer/js/modules/km/kmHandlers.js`
**Added currentKmId state:**

```javascript
// Line 11-12
const kmHandlers = {
    currentKbId: null,
    currentKmId: null,  // ✅ String km_id like "note_store"
    currentKbType: null,
    // ...
```

**Updated event listener to capture kmId:**

```javascript
// Line 27-35
window.addEventListener('km-switched', async (e) => {
    const { kbId, kmId, kbType } = e.detail;  // ✅ Destructure kmId
    this.currentKbId = kbId;
    this.currentKmId = kmId;  // ✅ Store string km_id
    this.currentKbType = kbType;
    console.log('[kmHandlers] KB switched to:', kbId, 'kmId:', kmId, 'type:', kbType);

    await this.initializePage(kbId, kmId, kbType);  // ✅ Pass kmId
});
```

**Updated initializePage signature:**

```javascript
// Line 60
async initializePage(kbId, kmId, kbType) {  // ✅ Accept kmId parameter
    // ...
    if (kbType === 1) {
        await this.loadNotesForKb(kbId, kmId);  // ✅ Pass kmId
    }
}
```

**Fixed loadNotesForKb to use search endpoint with string km_id:**

```javascript
// Line 137-169
async loadNotesForKb(kbId, kmId) {  // ✅ Accept kmId parameter
    const noteTree = document.getElementById(`noteTree-${kbId}`);
    if (!noteTree) {
        console.warn(`[kmHandlers] noteTree-${kbId} not found`);
        return;
    }

    const loading = Toast.loading('Loading notes...');

    try {
        // ✅ Use search endpoint with string kmId
        const url = `http://localhost:8788/api/km/notes/search?km_id=${encodeURIComponent(kmId)}`;
        console.log('[kmHandlers] Loading notes from:', url);

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const notes = await response.json();  // ✅ API returns array directly
        console.log(`[kmHandlers] Loaded ${notes.length} notes for kmId:`, kmId);

        this.notes[kbId] = Array.isArray(notes) ? notes : [];
        this.renderNoteList(kbId);
        this.bindNoteListEvents(kbId);
        loading.close();
    } catch (error) {
        console.error('[kmHandlers] Error loading notes:', error);
        loading.close();
        Toast.error('Failed to load notes');
        noteTree.innerHTML = '<div style="padding: 20px; color: #999;">Failed to load notes</div>';
    }
}
```

#### 3. `renderer/css/components.css`
**Added container height CSS:**

```css
/* Line 3729-3734 */
/* KM 主内容容器 - 动态渲染区域 */
.km-main-content-wrapper {
    height: 100%;
    display: flex;
    flex-direction: column;
}
```

### Backend Changes

#### 4. `backend/modules/km/note_router.py`
**Fixed parameter type and route ordering:**

```python
# Line 18-37: Reordered routes - specific before dynamic
@router.get("/notes", response_model=List[NoteResponse])
async def get_all_notes():
    """获取所有笔记列表"""
    # ...

@router.get("/notes/search", response_model=List[NoteResponse])  # ✅ Specific route first
async def search_notes(query: str = "", km_id: str = None):  # ✅ Changed from int to str
    """搜索笔记 - 支持标题、内容、标签搜索"""
    try:
        notes = note_service.search_notes(query=query, km_id=km_id)
        return notes
    except Exception as e:
        logger.error(f"Error searching notes: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/notes/{note_id}", response_model=NoteResponse)  # ✅ Dynamic route after
async def get_note(note_id: int):
    """获取单个笔记"""
    # ...
```

#### 5. `backend/modules/km/note_service.py`
**Fixed parameter type:**

```python
# Line 269
def search_notes(self, query: str = "", km_id: str = None) -> List[Dict]:  # ✅ Changed from int to str
    """
    搜索笔记

    Args:
        query: 搜索关键词（搜索标题、内容、标签）
        km_id: 知识库ID（字符串，如"note_store"，可选，用于过滤特定知识库的笔记）

    Returns:
        符合条件的笔记列表
    """
    session = SessionLocal()
    try:
        filters = [NoteMng.is_delete == False]

        # ✅ Filter by string km_id
        if km_id is not None:
            filters.append(NoteMng.km_id == km_id)  # String comparison

        # ... rest of the method
```

---

## 🧪 Testing

### Test 1: API Endpoint
```bash
curl "http://localhost:8788/api/km/notes/search?km_id=note_store"
```

**Expected Result:**
```json
[
  {
    "id": 189,
    "title": "amazon",
    "content": "...",
    "tags": [],
    "is_pinned": true,
    "created_at": "2025-11-16T21:59:05.697408",
    "updated_at": "2026-01-11T17:25:38.617342"
  },
  // ... 64 more notes
]
```

**Actual Result:** ✅ Returns 65 notes

### Test 2: Frontend Loading
1. Open Electron app
2. Navigate to KM module
3. Click "My Note" KB in sidebar
4. Check browser console

**Expected Console Output:**
```
[KMSidebar] Switching to KB: 4
[KMSidebar] Expanded KB section container: 4
[kmHandlers] KB switched to: 4 kmId: note_store type: 1
[kmHandlers] Initializing page for KB 4 (kmId: note_store, type: 1)
[kmHandlers] Rendered page HTML for type: 1
[kmHandlers] Loading notes from: http://localhost:8788/api/km/notes/search?km_id=note_store
[kmHandlers] Loaded 65 notes for kmId: note_store
[kmHandlers] KMNotePage initialized
```

### Test 3: Editor Height
1. Open note editor
2. Check that editor content area fills available vertical space
3. Verify scrolling works when content exceeds viewport

**Expected:** Editor expands to 100% height, content scrolls smoothly

---

## 🎯 Key Learnings

### 1. Database Schema Matters
- Always check actual column types in database
- Don't assume numeric IDs everywhere
- String identifiers are valid and common

### 2. API Type Safety
- FastAPI type hints must match database types
- `km_id: int` vs `km_id: str` causes silent failures
- Use proper type annotations

### 3. Route Ordering in FastAPI
- Specific routes MUST come before dynamic routes
- `/notes/search` before `/notes/{note_id}`
- Order matters for path matching

### 4. CSS Flex Layout
- Parent containers need explicit height for flex children to expand
- `flex: 1` only works if parent has defined height
- Use `height: 100%` cascade from root

### 5. Data Flow Consistency
- Pass both numeric ID (for DOM) and string ID (for API)
- Store both in data attributes: `data-kb-id` and `data-km-id`
- Use appropriate ID for each context

---

## 📊 Before vs After

### Before (❌ Broken)
```
Frontend: kbId=4 (numeric)
    ↓
API Call: /api/km/notes?km_id=4
    ↓
Backend: NoteMng.km_id == 4 (comparing string to int)
    ↓
Result: No matches, empty array
```

### After (✅ Fixed)
```
Frontend: kbId=4 (numeric), kmId="note_store" (string)
    ↓
API Call: /api/km/notes/search?km_id=note_store
    ↓
Backend: NoteMng.km_id == "note_store" (string comparison)
    ↓
Result: 65 notes found ✅
```

---

**Fix Date**: 2026-01-17
**Fixed By**: Claude Sonnet 4.5
**Status**: ✅ Both issues resolved
**Priority**: 🔴 High (Core functionality)
