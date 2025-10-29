import { file } from "bun";
Bun.serve({
    port: 3000,
    fetch(req) {
        const url = new URL(req.url);
        if (url.pathname === "/" || url.pathname === "/index.html") {
            return new Response(file("./index.html"));
        }
        try {
            return new Response(file("." + url.pathname));
        }
        catch {
            return new Response("Not Found", { status: 404 });
        }
    }
});
console.log("server running on port 3000");
//# sourceMappingURL=server.js.map