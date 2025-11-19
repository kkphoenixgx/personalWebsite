export class ViewportHelper {
  static isMobileSize(): boolean {
    return window.innerWidth <= 890;
  }

  static isTablet(): boolean {
    return window.innerWidth > 890 && window.innerWidth < 1260;
  }

  static isDesktop(): boolean {
    return window.innerWidth >= 1260;
  }

  static isMobile() :boolean {
    return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);  
  }


}
