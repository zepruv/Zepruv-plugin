#!/usr/bin/env node
// Checks the plugin files the way a user's Claude Code will read them: valid JSON, matching names and versions, every skill has front matter
// with a name equal to its folder and a description, and the MCP address is https. No dependencies.
import fs from 'node:fs'
import path from 'node:path'

const errors = []
const fail = (m) => errors.push(m)
const readJson = (f) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')) } catch (e) { fail(`${f}: not valid JSON (${e.message})`); return null } }

const plugin = readJson('.claude-plugin/plugin.json')
const market = readJson('.claude-plugin/marketplace.json')
const mcp = readJson('.mcp.json')

if (plugin) {
    if (!/^\d+\.\d+\.\d+$/.test(plugin.version || '')) fail('plugin.json: version must look like 1.2.3')
    if (!plugin.name || !plugin.description) fail('plugin.json: name and description are required')
}
if (market) {
    if (!market.description) fail('marketplace.json: description is required')
    const entry = (market.plugins || []).find((p) => p.name === plugin?.name)
    if (!entry) fail('marketplace.json: no plugin entry named like plugin.json')
}
if (mcp) {
    const servers = Object.entries(mcp.mcpServers || {})
    if (servers.length === 0) fail('.mcp.json: no mcpServers')
    for (const [name, s] of servers) {
        const url = String(s.url || '')
        if (!/^\$\{[A-Z_]+:-https:\/\/[^}]+\}$|^https:\/\//.test(url)) fail(`.mcp.json: ${name} must point at an https address (got ${url})`)
    }
}

const skillsDir = 'skills'
for (const dir of fs.readdirSync(skillsDir)) {
    const file = path.join(skillsDir, dir, 'SKILL.md')
    if (!fs.existsSync(file)) { fail(`${skillsDir}/${dir}: SKILL.md is missing`); continue }
    const text = fs.readFileSync(file, 'utf8')
    const fm = text.match(/^---\n([\s\S]*?)\n---\n/)
    if (!fm) { fail(`${file}: front matter (--- block) is missing`); continue }
    const name = fm[1].match(/^name:\s*(.+)$/m)?.[1]?.trim()
    const desc = fm[1].match(/^description:\s*(.+)$/m)?.[1]?.trim()
    if (name !== dir) fail(`${file}: name "${name}" must equal the folder name "${dir}"`)
    if (!desc || desc.length < 20) fail(`${file}: description is missing or too short`)
}

if (errors.length) { console.error(errors.map((e) => `FAIL ${e}`).join('\n')); process.exit(1) }
console.log('plugin files OK')
