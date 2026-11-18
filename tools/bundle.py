# Stitch the split repo back into one HTML file for the Claude preview artifact (not part of the repo).
import re,sys
R=sys.argv[1];h=open(R+'/index.html').read()
h=re.sub(r'<link rel="stylesheet" href="([^"?]+)\?v=\d+">',lambda m:'<style>\n'+open(R+'/'+m.group(1)).read()+'</style>',h)
h=re.sub(r'<script src="([^"?]+)\?v=\d+" defer></script>\n?',lambda m:'<script>\n'+open(R+'/'+m.group(1)).read()+'</script>\n',h)
open(sys.argv[2],'w').write(h);print('bundled',len(h))
