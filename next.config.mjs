/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Handle ONNX Runtime for @imgly/background-removal
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      }
    }
    
    // Handle .wasm files for ONNX models
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    }
    
    return config
  },
}

export default nextConfig