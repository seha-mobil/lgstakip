import re

path = r'C:\Users\sehat\.gemini\antigravity\scratch\lgstakip\app\student\[id]\ders-plani\DersPlaniClient.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Target: 
# <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
#     <div style={{ display: 'flex', alignItems: 'center', gap: '6px', ...

# Using a flexible regex that ignores exact space count
pattern = re.compile(r'(<div style={{ display: \'flex\', alignItems: \'center\', gap: \'8px\' }}>\s+)(<div style={{ display: \'flex\', alignItems: \'center\', gap: \'6px\', padding: \'2px 8px\', borderRadius: \'8px\', background: \'rgba\(255,255,255,0.03\)\', border: \'1px solid var\(--border\)\', userSelect: \'none\' }}>)', re.MULTILINE)

replacement = r'\1<div title={`Tamamlama Oranı: %${Math.min(100, Math.round(((ud.correct + ud.wrong) / 500) * 100))}`} style={{ width: "40px", height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden", border: "1px solid var(--border)", flexShrink: 0 }}><div style={{ height: "100%", width: `${Math.min(100, Math.round(((ud.correct + ud.wrong) / 500) * 100))}%`, background: s.color, opacity: 0.6 }}></div></div>\n                                                                     \2'

new_content = pattern.sub(replacement, content)

if new_content != content:
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("SUCCESS")
else:
    print("FAIL")
