import { NextResponse } from 'next/server';

/**
 * Creates a standardized success response
 */
export function createSuccessResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({
    success: true,
    data
  }, { status });
}

/**
 * Creates a standardized error response
 */
export function createErrorResponse(message: string, status = 500, details?: any): NextResponse {
  return NextResponse.json({
    success: false,
    error: message,
    details
  }, { status });
}

/**
 * Safely parses a JSON string
 */
export function safeJsonParse<T>(json: string): T | null {
  try {
    return JSON.parse(json) as T;
  } catch (e) {
    return null;
  }
}

/**
 * Builds a MongoDB query object from search parameters
 */
export function buildDateQuery(dateFrom?: string | null, dateTo?: string | null) {
  const query: any = {};
  
  if (dateFrom || dateTo) {
    query.createdAt = {};
    
    if (dateFrom) {
      query.createdAt.$gte = new Date(dateFrom);
    }
    
    if (dateTo) {
      // Add one day to include the end date fully
      const endDate = new Date(dateTo);
      endDate.setDate(endDate.getDate() + 1);
      query.createdAt.$lte = endDate;
    }
  }
  
  return query;
}
