#!/usr/bin/env python3
import http.server, socketserver, os, sys

PORT = int(os.environ.get("PORT", sys.argv[1] if len(sys.argv) > 1 else 3460))
os.chdir(os.path.dirname(os.path.abspath(__file__)))

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Serving Dozi store at http://localhost:{PORT}")
    httpd.serve_forever()
