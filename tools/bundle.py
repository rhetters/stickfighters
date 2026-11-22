# Stitch the split repo back into one HTML file for the Claude preview artifact (not part of the repo).
import re,sys
R=sys.argv[1];h=open(R+'/index.html').read()
h=re.sub(r'<link rel="stylesheet" href="([^"?]+)\?v=\d+">',lambda m:'<style>\n'+open(R+'/'+m.group(1)).read()+'</style>',h)
h=re.sub(r'<script src="([^"?]+)\?v=\d+" defer></script>\n?',lambda m:'<script>\n'+open(R+'/'+m.group(1)).read()+'</script>\n',h)
# images the stylesheet uses (url(../img/…)) go in as data URIs, since the preview is a single file
import base64
h=re.sub(r'url\(\.\./(img/[^)?]+)\)',lambda m:'url(data:image/'+('jpeg' if m.group(1).endswith('.jpg') else 'svg+xml' if m.group(1).endswith('.svg') else m.group(1).rsplit('.',1)[1])+';base64,'+base64.b64encode(open(R+'/'+m.group(1),'rb').read()).decode()+')',h)
open(sys.argv[2],'w').write(h);print('bundled',len(h))
