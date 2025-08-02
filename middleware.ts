import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 基於環境變數動態生成允許的域名
function getAllowedOrigins(): string[] {
  const rpId = process.env.NEXT_PUBLIC_RP_ID || 'host.moo.edu.pl';
  
  // 基本允許的域名
  const baseOrigins = [
    `https://${rpId}`,
    `http://${rpId}`,
  ];
  
  return baseOrigins;
}

// 檢查是否為允許的子域名
function isAllowedSubdomain(origin: string): boolean {
  const rpId = process.env.NEXT_PUBLIC_RP_ID || 'host.moo.edu.pl';
  
  try {
    const originUrl = new URL(origin);
    const originHost = originUrl.hostname;
    
    // 獲取基礎域名（例如：從 host.moo.edu.pl 獲取 moo.edu.pl）
    const rpParts = rpId.split('.');
    let baseDomain: string;
    
    if (rpParts.length >= 2) {
      // 如果 RP_ID 是 host.moo.edu.pl，則基礎域名是 moo.edu.pl
      baseDomain = rpParts.slice(-2).join('.');
    } else {
      // 如果 RP_ID 只是一個詞，則假設是 .com 域名
      baseDomain = `${rpId}.com`;
    }
    
    // 檢查是否為完全匹配或子域名
    return originHost === rpId || 
           originHost === baseDomain || 
           originHost.endsWith(`.${baseDomain}`);
           
  } catch (error) {
    console.error('Invalid origin URL:', origin);
    return false;
  }
}

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin');
  const allowedOrigins = getAllowedOrigins();
  
  // 檢查來源是否被允許
  let isAllowedOrigin = false;
  
  if (origin) {
    // 檢查是否在基本允許列表中
    isAllowedOrigin = allowedOrigins.includes(origin);
    
    // 如果不在基本列表中，檢查是否為允許的子域名
    if (!isAllowedOrigin) {
      isAllowedOrigin = isAllowedSubdomain(origin);
    }
  }
  
  const corsOrigin = isAllowedOrigin && origin ? origin : allowedOrigins[0];

  // 處理 CORS preflight 請求
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': corsOrigin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // 為所有 API 響應添加 CORS headers
  const response = NextResponse.next();
  
  response.headers.set('Access-Control-Allow-Origin', corsOrigin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  response.headers.set('Access-Control-Allow-Credentials', 'true');

  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
  ],
};
