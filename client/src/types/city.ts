export interface Weather { 
temp: number;
feelsLike?: number; // new
humidity: number;
pressure?: number; // new 
wind?: number; // new 
windDir?: number; // new 
visibility?: number; // new 
description?: string; // new 
icon?: string; // new 
country?: string; // new
sunrise?: number; // newSkyCast    — Complete Upgrade Guide
sunset?: number; // new 
error?: boolean; // new
}
export interface Risk { // new interface
level: string; 
color: string; 
}
export interface City { 
_id: string;
name: string; 
weather: Weather; 
isFavorite: boolean;
risk?: Risk; // new 
addedAt?: string; // new
}