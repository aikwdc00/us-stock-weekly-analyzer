/** @type {import('next').NextConfig} */
const nextConfig = {
	poweredByHeader: false,
	allowedDevOrigins: ["127.0.0.1"],
	async headers() {
		return [
			{
				source: "/(.*)",
				headers: [
					{ key: "X-Content-Type-Options", value: "nosniff" },
					{ key: "X-Frame-Options", value: "SAMEORIGIN" },
					{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
					{ key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
					{
						key: "Content-Security-Policy",
						value: "default-src 'self'; base-uri 'self'; frame-ancestors 'self'; form-action 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self'",
					},
				],
			},
		];
	},
	experimental: {
		serverActions: {
			bodySizeLimit: "2mb",
		},
	},
};

export default nextConfig;
