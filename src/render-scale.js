// Preserve the screen's native density; cap GPU work at a 4K frame.
export function renderScale(width,height,density=1,low=false){
  const w=Math.max(1,width),h=Math.max(1,height);
  const edge=low?1920:3840,pixels=low?1920*1080:3840*2160;
  return Math.max(.25,Math.min(Math.max(1,density||1),4,edge/Math.max(w,h),Math.sqrt(pixels/(w*h))));
}
