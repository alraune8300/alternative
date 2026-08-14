const rtfEn = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
console.log(rtfEn.format(0, 'second'));
console.log(rtfEn.format(-5, 'minute'));
