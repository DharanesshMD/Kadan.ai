# College/University Data

This directory contains comprehensive data about colleges and universities in the United States.

## Files

- `colleges.ts` - Contains all US colleges/universities by state with public/private classification

## Data Structure

```typescript
interface College {
  name: string;
  state: string;
  isPrivate: boolean;
}
```

## Usage

```typescript
import { COLLEGES_BY_STATE, getCollegesByState, getAllColleges } from '@/data/colleges';

// Get colleges for a specific state
const californiaColleges = getCollegesByState('California');

// Get all colleges
const allColleges = getAllColleges();

// Access colleges by state directly
const texasColleges = COLLEGES_BY_STATE['Texas'];
```

## Features

- **State-based Organization**: All colleges are organized by US state
- **Private/Public Classification**: Each college is marked as private or public
- **Search Friendly**: Easy to filter and search through colleges
- **Comprehensive Coverage**: Includes major universities and colleges across all 50 states

## Data Coverage

The database includes:
- Major research universities
- Liberal arts colleges
- Public state universities
- Private institutions
- Both large and specialized institutions

Each state typically has 3-10 colleges listed, with a focus on popular and well-known institutions that students commonly apply to.
