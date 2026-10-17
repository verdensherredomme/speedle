import type { AnimalId } from "./game.ts";

const drawings: Record<AnimalId, string> = {
  cheetah: `
    <g fill="#dda544" stroke="#193d56" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <path d="M150 153C112 159 83 143 69 116C59 97 46 96 43 106C40 120 59 146 83 158C103 169 127 174 153 171" fill="none" stroke-width="10"/>
      <path d="M161 145L137 182 101 198 87 195 92 189 126 173 141 140Z"/>
      <path d="M206 146L202 178 173 203 157 203 159 195 187 167 185 145Z"/>
      <path d="M271 137L295 167 333 178 344 187 325 190 280 176 250 147Z"/>
      <path d="M286 129L321 137 350 125 363 129 360 137 321 153 280 149Z"/>
      <path d="M141 136C155 112 202 109 241 116L278 107 302 113 298 140C279 159 240 153 215 151 188 160 155 159 141 146Z"/>
      <path d="M279 114L294 94 301 78 315 76 323 84 338 87 348 101 338 114 312 119 298 133Z"/>
      <path d="M304 80L302 67Q316 63 320 79Z"/>
      <path d="M330 90L333 92" fill="none" stroke-width="5"/>
      <path d="M336 98L338 107M344 101L349 101" fill="none"/>
    </g>
    <g fill="#193d56">
      <circle cx="160" cy="134" r="3"/><circle cx="178" cy="126" r="3"/><circle cx="185" cy="143" r="3"/>
      <circle cx="200" cy="126" r="3"/><circle cx="213" cy="139" r="3"/><circle cx="226" cy="127" r="3"/>
      <circle cx="242" cy="139" r="3"/><circle cx="257" cy="125" r="3"/><circle cx="272" cy="139" r="3"/>
      <circle cx="293" cy="115" r="3"/><circle cx="304" cy="101" r="3"/><circle cx="155" cy="158" r="3"/>
      <path d="M57 128L63 123 68 131 62 137ZM71 146L77 140 83 146 77 153Z"/>
    </g>`,
  giraffe: `
    <g fill="#e9b858" stroke="#193d56" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
      <path d="M157 144Q125 151 119 129" fill="none" stroke-width="6"/>
      <path d="M165 144L153 211 140 213 141 205 148 141ZM191 147L194 208 181 211 179 204 177 147ZM238 144L253 207 242 211 236 202 220 146ZM258 138L285 197 277 205 269 198 245 145Z"/>
      <path d="M151 122Q176 104 223 120L247 64 259 36 277 44 264 128Q255 153 222 153L155 147Z"/>
      <path d="M254 39L255 26 264 26 267 37 292 40 299 49 288 57 266 51Z"/>
      <path d="M260 30L260 17M272 35L276 22M258 39L243 31 246 43Z" fill="none"/>
    </g>
    <g fill="#9c622d">
      <path d="M160 125L177 120 183 132 172 142 158 136ZM190 122L208 123 210 137 198 147 186 138ZM221 128L236 129 238 141 222 148 214 137ZM241 101L251 98 254 112 244 122 236 116ZM252 70L264 68 263 85 250 89ZM263 44L272 44 272 53 263 58Z"/>
    </g><circle cx="284" cy="45" r="2.5" fill="#193d56"/>`,
  ostrich: `
    <g stroke="#193d56" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
      <path d="M194 149L204 181 177 211 165 212M219 147L228 178 265 198 279 196" fill="none" stroke="#bb7b65" stroke-width="8"/>
      <path d="M158 119L132 95 138 128 125 134 153 141" fill="#193d56"/>
      <ellipse cx="194" cy="131" rx="49" ry="33" fill="#193d56"/>
      <path d="M227 132Q262 114 253 83Q242 50 259 39" fill="none" stroke="#bb7b65" stroke-width="13"/>
      <path d="M164 116Q193 104 223 125L213 146Q184 153 164 116Z" fill="#fffaf0" stroke="none"/>
      <ellipse cx="265" cy="37" rx="14" ry="11" fill="#bb7b65"/>
      <path d="M278 36L295 42 278 46" fill="#e9b858"/>
    </g><circle cx="269" cy="34" r="3" fill="#193d56"/>`,
  pronghorn: `
    <g fill="#bc8450" stroke="#193d56" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <path d="M147 133L131 118 126 123 145 145Z"/>
      <path d="M160 146L143 187 117 207 103 207 104 199 130 178 140 139ZM184 145L191 200 180 207 173 202 170 148ZM249 143L266 173 299 190 309 190 313 198 298 201 252 181 231 150ZM263 132L297 145 327 133 337 137 335 145 296 159 260 151Z"/>
      <path d="M145 124Q185 105 226 121L253 102 273 106 267 137Q245 157 202 152L153 150Z"/>
      <path d="M249 113L262 83 272 69 293 76 304 92 292 104 273 101 265 126Z"/>
      <path d="M274 75L260 60 260 76 271 84ZM279 71Q267 49 279 31L282 51 289 46 285 68M290 76Q290 54 302 38L301 60 308 56 299 78" fill="#193d56"/>
      <path d="M147 128L165 125 163 146 151 147ZM255 111L266 99 273 108 266 127Z" fill="#fffaf0" stroke="none"/>
    </g><circle cx="290" cy="82" r="3" fill="#193d56"/>`,
};

export function illustration(id: AnimalId): string {
  return `<svg class="animal-art" viewBox="0 0 420 245" aria-hidden="true">
    <circle cx="289" cy="83" r="63" fill="#f9cd53" opacity=".6"/>
    <path d="M41 212Q141 185 224 207T386 201" fill="none" stroke="#b6d3dd" stroke-width="2"/>
    <path d="M56 204L52 190M58 204L64 195M359 202L363 186M360 202L354 191" fill="none" stroke="#7a9e9c" stroke-width="2" stroke-linecap="round"/>
    <ellipse cx="216" cy="215" rx="108" ry="7" fill="#c4dce5"/>
    ${drawings[id]}
  </svg>`;
}
