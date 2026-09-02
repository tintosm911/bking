#!/usr/bin/env bash
# 修复 fontkit@1.9.0 的 ESM/CJS 构建 bug：
#   fontkit import 的是 camelCase `applyDecoratedDescriptor`，而 @swc/helpers 只导出 snake_case `_apply_decorated_descriptor`。
#   这里给 @swc/helpers 补一个 camelCase 别名，幂等（已存在则跳过）。
set -euo pipefail

HELPERS_DIR="node_modules/@swc/helpers"
ESM_FILE="$HELPERS_DIR/esm/index.js"
CJS_FILE="$HELPERS_DIR/cjs/index.cjs"

if [ ! -f "$ESM_FILE" ]; then
  echo "[patch-swc-helpers] ESM 入口不存在，跳过: $ESM_FILE"
  exit 0
fi

patch_esm() {
  local f="$1"
  if grep -q "applyDecoratedDescriptor" "$f"; then
    echo "[patch-swc-helpers] ESM 已包含 camelCase，跳过"
    return 0
  fi
  # 追加一行：补 camelCase 别名
  printf '\nexport { _ as applyDecoratedDescriptor } from "./_apply_decorated_descriptor.js";\n' >> "$f"
  echo "[patch-swc-helpers] ESM 已补 camelCase 别名"
}

patch_cjs() {
  local f="$1"
  if grep -q "applyDecoratedDescriptor" "$f"; then
    echo "[patch-swc-helpers] CJS 已包含 camelCase，跳过"
    return 0
  fi
  # 追加 getter
  printf '\nObject.defineProperty(exports, "applyDecoratedDescriptor", { get: function() { return exports._apply_decorated_descriptor; }, enumerable: false, configurable: true });\n' >> "$f"
  echo "[patch-swc-helpers] CJS 已补 camelCase getter"
}

patch_esm "$ESM_FILE"
patch_cjs "$CJS_FILE"
echo "[patch-swc-helpers] 完成"