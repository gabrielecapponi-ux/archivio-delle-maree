import {defineConfig,devices} from '@playwright/test';
export default defineConfig({
  testDir:'./tests',timeout:120000,workers:1,reporter:'list',
  use:{baseURL:'http://127.0.0.1:5173',headless:true,reducedMotion:'reduce'},
  projects:[
    {name:'iphone-webkit',testMatch:['browser.spec.js','archive.spec.js'],grep:/il capitolo si completa|percorso completo e finale liberare/,use:{...devices['iPhone 13'],browserName:'webkit'}},
    {name:'iphone-retina',testMatch:'phone.spec.js',use:{...devices['iPhone 13'],browserName:'chromium',channel:'chrome'}},
    {name:'portrait-fullhd',testMatch:'phone.spec.js',grep:/verticale/,use:{browserName:'chromium',channel:'chrome',viewport:{width:360,height:640},deviceScaleFactor:3,isMobile:true,hasTouch:true}},
    {name:'portrait-4k',testMatch:'phone.spec.js',grep:/verticale/,use:{browserName:'chromium',channel:'chrome',viewport:{width:720,height:1280},deviceScaleFactor:3,isMobile:true,hasTouch:true}},
  ],
});
