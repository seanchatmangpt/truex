# Experimental Project Report: neako

> **Status:** Analyzed as part of the Vision 2030 Global Audit
> **Path:** `/Users/sac/neako`

## 1. Audit Status
- **Test Status:** ❌ Failing / Broken Build

## 2. Executable Entry Points
- `neako/docs/VALIDATE-YC-DEMO.sh`
- `neako/generate-direct.sh`
- `neako/generate-stack.sh`
- `neako/generate.sh`
- `neako/package.json`
- `neako/scripts/run-ios.sh`
- `neako/validate-project.sh`
- `neako/vendors/nuxt-ui-chat/package.json`
- `neako/vendors/nuxt-ui-dashboard/package.json`

## 3. Extracted Documentation & Context
### Source: `neako/CLAUDE.md`
```markdown
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NEAKO Cosmos is an **ontology-driven full-stack application** that implements a signal-based knowledge network. The entire codebase is generated from RDF/OWL ontologies using `rgen`, making this a unique semantic web project where the ontology is the source of truth.

**Core Concept:** Entities emit Signals that exist in Fields and Threads. Complementary Signals (like Offer ↔ Request) automatically form Constellations through AI-powered matching.

## Critical Architecture Principles

### 1. Ontology-First Development Model

**This is the most important concept to understand:** The majority of the codebase is **generated** from ontologies, not written manually.

**Source of Truth Hierarchy:**
```
graphs/neako.owl.ttl (domain ontology)
  ↓ defines what (Entities, Signals, Constellations)
graphs/supanuxt.owl.ttl (tech ontology)
  ↓ defines how (Supabase tables, Nuxt pages)
graphs/neako-project.ttl (instance mappings)
  ↓ maps domain → tech
templates/**/*.tmpl (code generation templates)
  ↓ SPARQL queries + Tera templates
generate.sh / generate-stack.sh
  ↓ executes rgen to generate code
```

**Workflow for Changes:**
1. **DO NOT** manually edit generated files (migrations, base pages, composables) unless fixing bugs
2. **DO** edit ontologies in `graphs/` for structural changes
3. **DO** edit templates in `templates/` for code pattern changes
4. **DO** run `./generate.sh` to regenerate after ontology/template changes
5. **DO** run `npm run db:migrate` and `npm run types` after regeneration

### 2. Three-Layer Stack Architecture

```
...
```

### Source: `neako/FINAL-SUMMARY.md`
```markdown
# NEAKO Cosmos - Final Project Summary

**Status:** ✅ **COMPLETE & READY**
**Date:** 2025-01-08
**Total Time:** ~45 minutes end-to-end

---

## 🎯 Mission Accomplished

Created a **production-ready, ontology-driven full-stack application** from scratch using:
- **rgen** for code generation from RDF/OWL ontologies
- **Nuxt UI** dashboard template for professional interface
- **Supabase** for PostgreSQL backend with RLS
- **NEAKO domain model** for signal-based knowledge network

---

## 📊 Final Statistics

### Generated Artifacts
```
Ontologies:       3 files (570 lines)
Templates:        6 files (328 lines)
Migrations:       3 files (119 lines)
Pages:            6 Vue components
Layouts:          1 dashboard layout
Composables:      1 Supabase integration
Configuration:    7 files (nuxt.config, package.json, etc.)
Documentation:    7 comprehensive guides
Scripts:          2 generation + 1 validation
```

### Project Metrics
```
Database Tables:     7 (entities, signals, fields, threads, constellations, signal_links, agents)
Security Policies:   6 RLS policies
Entity Types:        8 (Person, Group, Project, Object, Idea, Place, Event, Agent)
Signal Types:        6 (Offer, Request, Update, Invitation, Opportunity, Reflection)
UI Pages:            6 routes with navigation
...
```

### Source: `neako/GENERATION-REPORT.md`
```markdown
# NEAKO Cosmos - Generation Report

**Ontology-Driven Full-Stack Application**
**Generated:** 2025-01-08
**Framework:** rgen (RDF-based code generation)
**Stack:** Supabase × Nuxt 3

---

## 🎯 Mission Accomplished

Successfully created a complete, production-ready Supabase × Nuxt application from OWL/Turtle ontologies using `rgen` templates and SPARQL queries.

## 📊 What Was Generated

### Project Statistics

| Metric | Count |
|--------|-------|
| **Ontology Files** | 3 |
| **Templates Created** | 6 |
| **Database Tables** | 7 |
| **Migrations** | 3 |
| **Nuxt Pages** | 1 |
| **Composables** | 1 |
| **Config Files** | 4 |
| **Total Lines of Code** | ~800+ |
| **Generation Time** | < 2 minutes |

### File Inventory

```
/Users/sac/neako/
├── graphs/                           # Ontologies (RDF/OWL)
│   ├── neako.owl.ttl                # Domain ontology
│   ├── supanuxt.owl.ttl             # Tech stack ontology
│   └── neako-project.ttl            # Project instance data
│
├── templates/                        # rgen Templates
│   ├── supabase/
...
```

*(Plus 40 other markdown files)*
