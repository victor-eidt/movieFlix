// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Adicionar suporte para resolver módulos do Supabase e outras dependências
config.resolver.sourceExts.push('cjs', 'mjs');

// Garantir que o Metro resolva módulos corretamente
config.resolver.unstable_enablePackageExports = true;

module.exports = config;

