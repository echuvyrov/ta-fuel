import { writable } from 'svelte/store'

export const currentDate = writable(new Date().toString().split('T')[0])