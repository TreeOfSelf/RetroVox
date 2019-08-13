/*
  ___  _  _  __    __    __  __ _   ___ 
 / __)/ )( \(  )  (  )  (  )(  ( \ / __)
( (__ ) \/ (/ (_/\/ (_/\ )( /    /( (_ \
 \___)\____/\____/\____/(__)\_)__) \___/																							
Seperate culling process that gets created as a worker. Goes through nearby chunks and returns culled chunk data. 
*/

//glMatrix for vector math
!function(t,n){"object"==typeof exports&&"undefined"!=typeof module?n(exports):"function"==typeof define&&define.amd?define(["exports"],n):n((t=t||self).glMatrix={})}(this,function(t){"use strict";var n=1e-6,a="undefined"!=typeof Float32Array?Float32Array:Array,r=Math.random;var u=Math.PI/180;Math.hypot||(Math.hypot=function(){for(var t=0,n=arguments.length;n--;)t+=arguments[n]*arguments[n];return Math.sqrt(t)});var e=Object.freeze({EPSILON:n,get ARRAY_TYPE(){return a},RANDOM:r,setMatrixArrayType:function(t){a=t},toRadian:function(t){return t*u},equals:function(t,a){return Math.abs(t-a)<=n*Math.max(1,Math.abs(t),Math.abs(a))}});function o(t,n,a){var r=n[0],u=n[1],e=n[2],o=n[3],i=a[0],c=a[1],h=a[2],s=a[3];return t[0]=r*i+e*c,t[1]=u*i+o*c,t[2]=r*h+e*s,t[3]=u*h+o*s,t}function i(t,n,a){return t[0]=n[0]-a[0],t[1]=n[1]-a[1],t[2]=n[2]-a[2],t[3]=n[3]-a[3],t}var c=o,h=i,s=Object.freeze({create:function(){var t=new a(4);return a!=Float32Array&&(t[1]=0,t[2]=0),t[0]=1,t[3]=1,t},clone:function(t){var n=new a(4);return n[0]=t[0],n[1]=t[1],n[2]=t[2],n[3]=t[3],n},copy:function(t,n){return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t},identity:function(t){return t[0]=1,t[1]=0,t[2]=0,t[3]=1,t},fromValues:function(t,n,r,u){var e=new a(4);return e[0]=t,e[1]=n,e[2]=r,e[3]=u,e},set:function(t,n,a,r,u){return t[0]=n,t[1]=a,t[2]=r,t[3]=u,t},transpose:function(t,n){if(t===n){var a=n[1];t[1]=n[2],t[2]=a}else t[0]=n[0],t[1]=n[2],t[2]=n[1],t[3]=n[3];return t},invert:function(t,n){var a=n[0],r=n[1],u=n[2],e=n[3],o=a*e-u*r;return o?(o=1/o,t[0]=e*o,t[1]=-r*o,t[2]=-u*o,t[3]=a*o,t):null},adjoint:function(t,n){var a=n[0];return t[0]=n[3],t[1]=-n[1],t[2]=-n[2],t[3]=a,t},determinant:function(t){return t[0]*t[3]-t[2]*t[1]},multiply:o,rotate:function(t,n,a){var r=n[0],u=n[1],e=n[2],o=n[3],i=Math.sin(a),c=Math.cos(a);return t[0]=r*c+e*i,t[1]=u*c+o*i,t[2]=r*-i+e*c,t[3]=u*-i+o*c,t},scale:function(t,n,a){var r=n[0],u=n[1],e=n[2],o=n[3],i=a[0],c=a[1];return t[0]=r*i,t[1]=u*i,t[2]=e*c,t[3]=o*c,t},fromRotation:function(t,n){var a=Math.sin(n),r=Math.cos(n);return t[0]=r,t[1]=a,t[2]=-a,t[3]=r,t},fromScaling:function(t,n){return t[0]=n[0],t[1]=0,t[2]=0,t[3]=n[1],t},str:function(t){return"mat2("+t[0]+", "+t[1]+", "+t[2]+", "+t[3]+")"},frob:function(t){return Math.hypot(t[0],t[1],t[2],t[3])},LDU:function(t,n,a,r){return t[2]=r[2]/r[0],a[0]=r[0],a[1]=r[1],a[3]=r[3]-t[2]*a[1],[t,n,a]},add:function(t,n,a){return t[0]=n[0]+a[0],t[1]=n[1]+a[1],t[2]=n[2]+a[2],t[3]=n[3]+a[3],t},subtract:i,exactEquals:function(t,n){return t[0]===n[0]&&t[1]===n[1]&&t[2]===n[2]&&t[3]===n[3]},equals:function(t,a){var r=t[0],u=t[1],e=t[2],o=t[3],i=a[0],c=a[1],h=a[2],s=a[3];return Math.abs(r-i)<=n*Math.max(1,Math.abs(r),Math.abs(i))&&Math.abs(u-c)<=n*Math.max(1,Math.abs(u),Math.abs(c))&&Math.abs(e-h)<=n*Math.max(1,Math.abs(e),Math.abs(h))&&Math.abs(o-s)<=n*Math.max(1,Math.abs(o),Math.abs(s))},multiplyScalar:function(t,n,a){return t[0]=n[0]*a,t[1]=n[1]*a,t[2]=n[2]*a,t[3]=n[3]*a,t},multiplyScalarAndAdd:function(t,n,a,r){return t[0]=n[0]+a[0]*r,t[1]=n[1]+a[1]*r,t[2]=n[2]+a[2]*r,t[3]=n[3]+a[3]*r,t},mul:c,sub:h});function M(t,n,a){var r=n[0],u=n[1],e=n[2],o=n[3],i=n[4],c=n[5],h=a[0],s=a[1],M=a[2],f=a[3],l=a[4],v=a[5];return t[0]=r*h+e*s,t[1]=u*h+o*s,t[2]=r*M+e*f,t[3]=u*M+o*f,t[4]=r*l+e*v+i,t[5]=u*l+o*v+c,t}function f(t,n,a){return t[0]=n[0]-a[0],t[1]=n[1]-a[1],t[2]=n[2]-a[2],t[3]=n[3]-a[3],t[4]=n[4]-a[4],t[5]=n[5]-a[5],t}var l=M,v=f,b=Object.freeze({create:function(){var t=new a(6);return a!=Float32Array&&(t[1]=0,t[2]=0,t[4]=0,t[5]=0),t[0]=1,t[3]=1,t},clone:function(t){var n=new a(6);return n[0]=t[0],n[1]=t[1],n[2]=t[2],n[3]=t[3],n[4]=t[4],n[5]=t[5],n},copy:function(t,n){return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t},identity:function(t){return t[0]=1,t[1]=0,t[2]=0,t[3]=1,t[4]=0,t[5]=0,t},fromValues:function(t,n,r,u,e,o){var i=new a(6);return i[0]=t,i[1]=n,i[2]=r,i[3]=u,i[4]=e,i[5]=o,i},set:function(t,n,a,r,u,e,o){return t[0]=n,t[1]=a,t[2]=r,t[3]=u,t[4]=e,t[5]=o,t},invert:function(t,n){var a=n[0],r=n[1],u=n[2],e=n[3],o=n[4],i=n[5],c=a*e-r*u;return c?(c=1/c,t[0]=e*c,t[1]=-r*c,t[2]=-u*c,t[3]=a*c,t[4]=(u*i-e*o)*c,t[5]=(r*o-a*i)*c,t):null},determinant:function(t){return t[0]*t[3]-t[1]*t[2]},multiply:M,rotate:function(t,n,a){var r=n[0],u=n[1],e=n[2],o=n[3],i=n[4],c=n[5],h=Math.sin(a),s=Math.cos(a);return t[0]=r*s+e*h,t[1]=u*s+o*h,t[2]=r*-h+e*s,t[3]=u*-h+o*s,t[4]=i,t[5]=c,t},scale:function(t,n,a){var r=n[0],u=n[1],e=n[2],o=n[3],i=n[4],c=n[5],h=a[0],s=a[1];return t[0]=r*h,t[1]=u*h,t[2]=e*s,t[3]=o*s,t[4]=i,t[5]=c,t},translate:function(t,n,a){var r=n[0],u=n[1],e=n[2],o=n[3],i=n[4],c=n[5],h=a[0],s=a[1];return t[0]=r,t[1]=u,t[2]=e,t[3]=o,t[4]=r*h+e*s+i,t[5]=u*h+o*s+c,t},fromRotation:function(t,n){var a=Math.sin(n),r=Math.cos(n);return t[0]=r,t[1]=a,t[2]=-a,t[3]=r,t[4]=0,t[5]=0,t},fromScaling:function(t,n){return t[0]=n[0],t[1]=0,t[2]=0,t[3]=n[1],t[4]=0,t[5]=0,t},fromTranslation:function(t,n){return t[0]=1,t[1]=0,t[2]=0,t[3]=1,t[4]=n[0],t[5]=n[1],t},str:function(t){return"mat2d("+t[0]+", "+t[1]+", "+t[2]+", "+t[3]+", "+t[4]+", "+t[5]+")"},frob:function(t){return Math.hypot(t[0],t[1],t[2],t[3],t[4],t[5],1)},add:function(t,n,a){return t[0]=n[0]+a[0],t[1]=n[1]+a[1],t[2]=n[2]+a[2],t[3]=n[3]+a[3],t[4]=n[4]+a[4],t[5]=n[5]+a[5],t},subtract:f,multiplyScalar:function(t,n,a){return t[0]=n[0]*a,t[1]=n[1]*a,t[2]=n[2]*a,t[3]=n[3]*a,t[4]=n[4]*a,t[5]=n[5]*a,t},multiplyScalarAndAdd:function(t,n,a,r){return t[0]=n[0]+a[0]*r,t[1]=n[1]+a[1]*r,t[2]=n[2]+a[2]*r,t[3]=n[3]+a[3]*r,t[4]=n[4]+a[4]*r,t[5]=n[5]+a[5]*r,t},exactEquals:function(t,n){return t[0]===n[0]&&t[1]===n[1]&&t[2]===n[2]&&t[3]===n[3]&&t[4]===n[4]&&t[5]===n[5]},equals:function(t,a){var r=t[0],u=t[1],e=t[2],o=t[3],i=t[4],c=t[5],h=a[0],s=a[1],M=a[2],f=a[3],l=a[4],v=a[5];return Math.abs(r-h)<=n*Math.max(1,Math.abs(r),Math.abs(h))&&Math.abs(u-s)<=n*Math.max(1,Math.abs(u),Math.abs(s))&&Math.abs(e-M)<=n*Math.max(1,Math.abs(e),Math.abs(M))&&Math.abs(o-f)<=n*Math.max(1,Math.abs(o),Math.abs(f))&&Math.abs(i-l)<=n*Math.max(1,Math.abs(i),Math.abs(l))&&Math.abs(c-v)<=n*Math.max(1,Math.abs(c),Math.abs(v))},mul:l,sub:v});function m(){var t=new a(9);return a!=Float32Array&&(t[1]=0,t[2]=0,t[3]=0,t[5]=0,t[6]=0,t[7]=0),t[0]=1,t[4]=1,t[8]=1,t}function d(t,n,a){var r=n[0],u=n[1],e=n[2],o=n[3],i=n[4],c=n[5],h=n[6],s=n[7],M=n[8],f=a[0],l=a[1],v=a[2],b=a[3],m=a[4],d=a[5],x=a[6],p=a[7],y=a[8];return t[0]=f*r+l*o+v*h,t[1]=f*u+l*i+v*s,t[2]=f*e+l*c+v*M,t[3]=b*r+m*o+d*h,t[4]=b*u+m*i+d*s,t[5]=b*e+m*c+d*M,t[6]=x*r+p*o+y*h,t[7]=x*u+p*i+y*s,t[8]=x*e+p*c+y*M,t}function x(t,n,a){return t[0]=n[0]-a[0],t[1]=n[1]-a[1],t[2]=n[2]-a[2],t[3]=n[3]-a[3],t[4]=n[4]-a[4],t[5]=n[5]-a[5],t[6]=n[6]-a[6],t[7]=n[7]-a[7],t[8]=n[8]-a[8],t}var p=d,y=x,q=Object.freeze({create:m,fromMat4:function(t,n){return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[4],t[4]=n[5],t[5]=n[6],t[6]=n[8],t[7]=n[9],t[8]=n[10],t},clone:function(t){var n=new a(9);return n[0]=t[0],n[1]=t[1],n[2]=t[2],n[3]=t[3],n[4]=t[4],n[5]=t[5],n[6]=t[6],n[7]=t[7],n[8]=t[8],n},copy:function(t,n){return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t},fromValues:function(t,n,r,u,e,o,i,c,h){var s=new a(9);return s[0]=t,s[1]=n,s[2]=r,s[3]=u,s[4]=e,s[5]=o,s[6]=i,s[7]=c,s[8]=h,s},set:function(t,n,a,r,u,e,o,i,c,h){return t[0]=n,t[1]=a,t[2]=r,t[3]=u,t[4]=e,t[5]=o,t[6]=i,t[7]=c,t[8]=h,t},identity:function(t){return t[0]=1,t[1]=0,t[2]=0,t[3]=0,t[4]=1,t[5]=0,t[6]=0,t[7]=0,t[8]=1,t},transpose:function(t,n){if(t===n){var a=n[1],r=n[2],u=n[5];t[1]=n[3],t[2]=n[6],t[3]=a,t[5]=n[7],t[6]=r,t[7]=u}else t[0]=n[0],t[1]=n[3],t[2]=n[6],t[3]=n[1],t[4]=n[4],t[5]=n[7],t[6]=n[2],t[7]=n[5],t[8]=n[8];return t},invert:function(t,n){var a=n[0],r=n[1],u=n[2],e=n[3],o=n[4],i=n[5],c=n[6],h=n[7],s=n[8],M=s*o-i*h,f=-s*e+i*c,l=h*e-o*c,v=a*M+r*f+u*l;return v?(v=1/v,t[0]=M*v,t[1]=(-s*r+u*h)*v,t[2]=(i*r-u*o)*v,t[3]=f*v,t[4]=(s*a-u*c)*v,t[5]=(-i*a+u*e)*v,t[6]=l*v,t[7]=(-h*a+r*c)*v,t[8]=(o*a-r*e)*v,t):null},adjoint:function(t,n){var a=n[0],r=n[1],u=n[2],e=n[3],o=n[4],i=n[5],c=n[6],h=n[7],s=n[8];return t[0]=o*s-i*h,t[1]=u*h-r*s,t[2]=r*i-u*o,t[3]=i*c-e*s,t[4]=a*s-u*c,t[5]=u*e-a*i,t[6]=e*h-o*c,t[7]=r*c-a*h,t[8]=a*o-r*e,t},determinant:function(t){var n=t[0],a=t[1],r=t[2],u=t[3],e=t[4],o=t[5],i=t[6],c=t[7],h=t[8];return n*(h*e-o*c)+a*(-h*u+o*i)+r*(c*u-e*i)},multiply:d,translate:function(t,n,a){var r=n[0],u=n[1],e=n[2],o=n[3],i=n[4],c=n[5],h=n[6],s=n[7],M=n[8],f=a[0],l=a[1];return t[0]=r,t[1]=u,t[2]=e,t[3]=o,t[4]=i,t[5]=c,t[6]=f*r+l*o+h,t[7]=f*u+l*i+s,t[8]=f*e+l*c+M,t},rotate:function(t,n,a){var r=n[0],u=n[1],e=n[2],o=n[3],i=n[4],c=n[5],h=n[6],s=n[7],M=n[8],f=Math.sin(a),l=Math.cos(a);return t[0]=l*r+f*o,t[1]=l*u+f*i,t[2]=l*e+f*c,t[3]=l*o-f*r,t[4]=l*i-f*u,t[5]=l*c-f*e,t[6]=h,t[7]=s,t[8]=M,t},scale:function(t,n,a){var r=a[0],u=a[1];return t[0]=r*n[0],t[1]=r*n[1],t[2]=r*n[2],t[3]=u*n[3],t[4]=u*n[4],t[5]=u*n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t},fromTranslation:function(t,n){return t[0]=1,t[1]=0,t[2]=0,t[3]=0,t[4]=1,t[5]=0,t[6]=n[0],t[7]=n[1],t[8]=1,t},fromRotation:function(t,n){var a=Math.sin(n),r=Math.cos(n);return t[0]=r,t[1]=a,t[2]=0,t[3]=-a,t[4]=r,t[5]=0,t[6]=0,t[7]=0,t[8]=1,t},fromScaling:function(t,n){return t[0]=n[0],t[1]=0,t[2]=0,t[3]=0,t[4]=n[1],t[5]=0,t[6]=0,t[7]=0,t[8]=1,t},fromMat2d:function(t,n){return t[0]=n[0],t[1]=n[1],t[2]=0,t[3]=n[2],t[4]=n[3],t[5]=0,t[6]=n[4],t[7]=n[5],t[8]=1,t},fromQuat:function(t,n){var a=n[0],r=n[1],u=n[2],e=n[3],o=a+a,i=r+r,c=u+u,h=a*o,s=r*o,M=r*i,f=u*o,l=u*i,v=u*c,b=e*o,m=e*i,d=e*c;return t[0]=1-M-v,t[3]=s-d,t[6]=f+m,t[1]=s+d,t[4]=1-h-v,t[7]=l-b,t[2]=f-m,t[5]=l+b,t[8]=1-h-M,t},normalFromMat4:function(t,n){var a=n[0],r=n[1],u=n[2],e=n[3],o=n[4],i=n[5],c=n[6],h=n[7],s=n[8],M=n[9],f=n[10],l=n[11],v=n[12],b=n[13],m=n[14],d=n[15],x=a*i-r*o,p=a*c-u*o,y=a*h-e*o,q=r*c-u*i,g=r*h-e*i,A=u*h-e*c,w=s*b-M*v,R=s*m-f*v,z=s*d-l*v,P=M*m-f*b,j=M*d-l*b,I=f*d-l*m,S=x*I-p*j+y*P+q*z-g*R+A*w;return S?(S=1/S,t[0]=(i*I-c*j+h*P)*S,t[1]=(c*z-o*I-h*R)*S,t[2]=(o*j-i*z+h*w)*S,t[3]=(u*j-r*I-e*P)*S,t[4]=(a*I-u*z+e*R)*S,t[5]=(r*z-a*j-e*w)*S,t[6]=(b*A-m*g+d*q)*S,t[7]=(m*y-v*A-d*p)*S,t[8]=(v*g-b*y+d*x)*S,t):null},projection:function(t,n,a){return t[0]=2/n,t[1]=0,t[2]=0,t[3]=0,t[4]=-2/a,t[5]=0,t[6]=-1,t[7]=1,t[8]=1,t},str:function(t){return"mat3("+t[0]+", "+t[1]+", "+t[2]+", "+t[3]+", "+t[4]+", "+t[5]+", "+t[6]+", "+t[7]+", "+t[8]+")"},frob:function(t){return Math.hypot(t[0],t[1],t[2],t[3],t[4],t[5],t[6],t[7],t[8])},add:function(t,n,a){return t[0]=n[0]+a[0],t[1]=n[1]+a[1],t[2]=n[2]+a[2],t[3]=n[3]+a[3],t[4]=n[4]+a[4],t[5]=n[5]+a[5],t[6]=n[6]+a[6],t[7]=n[7]+a[7],t[8]=n[8]+a[8],t},subtract:x,multiplyScalar:function(t,n,a){return t[0]=n[0]*a,t[1]=n[1]*a,t[2]=n[2]*a,t[3]=n[3]*a,t[4]=n[4]*a,t[5]=n[5]*a,t[6]=n[6]*a,t[7]=n[7]*a,t[8]=n[8]*a,t},multiplyScalarAndAdd:function(t,n,a,r){return t[0]=n[0]+a[0]*r,t[1]=n[1]+a[1]*r,t[2]=n[2]+a[2]*r,t[3]=n[3]+a[3]*r,t[4]=n[4]+a[4]*r,t[5]=n[5]+a[5]*r,t[6]=n[6]+a[6]*r,t[7]=n[7]+a[7]*r,t[8]=n[8]+a[8]*r,t},exactEquals:function(t,n){return t[0]===n[0]&&t[1]===n[1]&&t[2]===n[2]&&t[3]===n[3]&&t[4]===n[4]&&t[5]===n[5]&&t[6]===n[6]&&t[7]===n[7]&&t[8]===n[8]},equals:function(t,a){var r=t[0],u=t[1],e=t[2],o=t[3],i=t[4],c=t[5],h=t[6],s=t[7],M=t[8],f=a[0],l=a[1],v=a[2],b=a[3],m=a[4],d=a[5],x=a[6],p=a[7],y=a[8];return Math.abs(r-f)<=n*Math.max(1,Math.abs(r),Math.abs(f))&&Math.abs(u-l)<=n*Math.max(1,Math.abs(u),Math.abs(l))&&Math.abs(e-v)<=n*Math.max(1,Math.abs(e),Math.abs(v))&&Math.abs(o-b)<=n*Math.max(1,Math.abs(o),Math.abs(b))&&Math.abs(i-m)<=n*Math.max(1,Math.abs(i),Math.abs(m))&&Math.abs(c-d)<=n*Math.max(1,Math.abs(c),Math.abs(d))&&Math.abs(h-x)<=n*Math.max(1,Math.abs(h),Math.abs(x))&&Math.abs(s-p)<=n*Math.max(1,Math.abs(s),Math.abs(p))&&Math.abs(M-y)<=n*Math.max(1,Math.abs(M),Math.abs(y))},mul:p,sub:y});function g(t){return t[0]=1,t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=1,t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[10]=1,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,t}function A(t,n,a){var r=n[0],u=n[1],e=n[2],o=n[3],i=n[4],c=n[5],h=n[6],s=n[7],M=n[8],f=n[9],l=n[10],v=n[11],b=n[12],m=n[13],d=n[14],x=n[15],p=a[0],y=a[1],q=a[2],g=a[3];return t[0]=p*r+y*i+q*M+g*b,t[1]=p*u+y*c+q*f+g*m,t[2]=p*e+y*h+q*l+g*d,t[3]=p*o+y*s+q*v+g*x,p=a[4],y=a[5],q=a[6],g=a[7],t[4]=p*r+y*i+q*M+g*b,t[5]=p*u+y*c+q*f+g*m,t[6]=p*e+y*h+q*l+g*d,t[7]=p*o+y*s+q*v+g*x,p=a[8],y=a[9],q=a[10],g=a[11],t[8]=p*r+y*i+q*M+g*b,t[9]=p*u+y*c+q*f+g*m,t[10]=p*e+y*h+q*l+g*d,t[11]=p*o+y*s+q*v+g*x,p=a[12],y=a[13],q=a[14],g=a[15],t[12]=p*r+y*i+q*M+g*b,t[13]=p*u+y*c+q*f+g*m,t[14]=p*e+y*h+q*l+g*d,t[15]=p*o+y*s+q*v+g*x,t}function w(t,n,a){var r=n[0],u=n[1],e=n[2],o=n[3],i=r+r,c=u+u,h=e+e,s=r*i,M=r*c,f=r*h,l=u*c,v=u*h,b=e*h,m=o*i,d=o*c,x=o*h;return t[0]=1-(l+b),t[1]=M+x,t[2]=f-d,t[3]=0,t[4]=M-x,t[5]=1-(s+b),t[6]=v+m,t[7]=0,t[8]=f+d,t[9]=v-m,t[10]=1-(s+l),t[11]=0,t[12]=a[0],t[13]=a[1],t[14]=a[2],t[15]=1,t}function R(t,n){return t[0]=n[12],t[1]=n[13],t[2]=n[14],t}function z(t,n){var a=n[0],r=n[1],u=n[2],e=n[4],o=n[5],i=n[6],c=n[8],h=n[9],s=n[10];return t[0]=Math.hypot(a,r,u),t[1]=Math.hypot(e,o,i),t[2]=Math.hypot(c,h,s),t}function P(t,n){var r=new a(3);z(r,n);var u=1/r[0],e=1/r[1],o=1/r[2],i=n[0]*u,c=n[1]*e,h=n[2]*o,s=n[4]*u,M=n[5]*e,f=n[6]*o,l=n[8]*u,v=n[9]*e,b=n[10]*o,m=i+M+b,d=0;return m>0?(d=2*Math.sqrt(m+1),t[3]=.25*d,t[0]=(f-v)/d,t[1]=(l-h)/d,t[2]=(c-s)/d):i>M&&i>b?(d=2*Math.sqrt(1+i-M-b),t[3]=(f-v)/d,t[0]=.25*d,t[1]=(c+s)/d,t[2]=(l+h)/d):M>b?(d=2*Math.sqrt(1+M-i-b),t[3]=(l-h)/d,t[0]=(c+s)/d,t[1]=.25*d,t[2]=(f+v)/d):(d=2*Math.sqrt(1+b-i-M),t[3]=(c-s)/d,t[0]=(l+h)/d,t[1]=(f+v)/d,t[2]=.25*d),t}function j(t,n,a){return t[0]=n[0]-a[0],t[1]=n[1]-a[1],t[2]=n[2]-a[2],t[3]=n[3]-a[3],t[4]=n[4]-a[4],t[5]=n[5]-a[5],t[6]=n[6]-a[6],t[7]=n[7]-a[7],t[8]=n[8]-a[8],t[9]=n[9]-a[9],t[10]=n[10]-a[10],t[11]=n[11]-a[11],t[12]=n[12]-a[12],t[13]=n[13]-a[13],t[14]=n[14]-a[14],t[15]=n[15]-a[15],t}var I=A,S=j,E=Object.freeze({create:function(){var t=new a(16);return a!=Float32Array&&(t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0),t[0]=1,t[5]=1,t[10]=1,t[15]=1,t},clone:function(t){var n=new a(16);return n[0]=t[0],n[1]=t[1],n[2]=t[2],n[3]=t[3],n[4]=t[4],n[5]=t[5],n[6]=t[6],n[7]=t[7],n[8]=t[8],n[9]=t[9],n[10]=t[10],n[11]=t[11],n[12]=t[12],n[13]=t[13],n[14]=t[14],n[15]=t[15],n},copy:function(t,n){return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],t},fromValues:function(t,n,r,u,e,o,i,c,h,s,M,f,l,v,b,m){var d=new a(16);return d[0]=t,d[1]=n,d[2]=r,d[3]=u,d[4]=e,d[5]=o,d[6]=i,d[7]=c,d[8]=h,d[9]=s,d[10]=M,d[11]=f,d[12]=l,d[13]=v,d[14]=b,d[15]=m,d},set:function(t,n,a,r,u,e,o,i,c,h,s,M,f,l,v,b,m){return t[0]=n,t[1]=a,t[2]=r,t[3]=u,t[4]=e,t[5]=o,t[6]=i,t[7]=c,t[8]=h,t[9]=s,t[10]=M,t[11]=f,t[12]=l,t[13]=v,t[14]=b,t[15]=m,t},identity:g,transpose:function(t,n){if(t===n){var a=n[1],r=n[2],u=n[3],e=n[6],o=n[7],i=n[11];t[1]=n[4],t[2]=n[8],t[3]=n[12],t[4]=a,t[6]=n[9],t[7]=n[13],t[8]=r,t[9]=e,t[11]=n[14],t[12]=u,t[13]=o,t[14]=i}else t[0]=n[0],t[1]=n[4],t[2]=n[8],t[3]=n[12],t[4]=n[1],t[5]=n[5],t[6]=n[9],t[7]=n[13],t[8]=n[2],t[9]=n[6],t[10]=n[10],t[11]=n[14],t[12]=n[3],t[13]=n[7],t[14]=n[11],t[15]=n[15];return t},invert:function(t,n){var a=n[0],r=n[1],u=n[2],e=n[3],o=n[4],i=n[5],c=n[6],h=n[7],s=n[8],M=n[9],f=n[10],l=n[11],v=n[12],b=n[13],m=n[14],d=n[15],x=a*i-r*o,p=a*c-u*o,y=a*h-e*o,q=r*c-u*i,g=r*h-e*i,A=u*h-e*c,w=s*b-M*v,R=s*m-f*v,z=s*d-l*v,P=M*m-f*b,j=M*d-l*b,I=f*d-l*m,S=x*I-p*j+y*P+q*z-g*R+A*w;return S?(S=1/S,t[0]=(i*I-c*j+h*P)*S,t[1]=(u*j-r*I-e*P)*S,t[2]=(b*A-m*g+d*q)*S,t[3]=(f*g-M*A-l*q)*S,t[4]=(c*z-o*I-h*R)*S,t[5]=(a*I-u*z+e*R)*S,t[6]=(m*y-v*A-d*p)*S,t[7]=(s*A-f*y+l*p)*S,t[8]=(o*j-i*z+h*w)*S,t[9]=(r*z-a*j-e*w)*S,t[10]=(v*g-b*y+d*x)*S,t[11]=(M*y-s*g-l*x)*S,t[12]=(i*R-o*P-c*w)*S,t[13]=(a*P-r*R+u*w)*S,t[14]=(b*p-v*q-m*x)*S,t[15]=(s*q-M*p+f*x)*S,t):null},adjoint:function(t,n){var a=n[0],r=n[1],u=n[2],e=n[3],o=n[4],i=n[5],c=n[6],h=n[7],s=n[8],M=n[9],f=n[10],l=n[11],v=n[12],b=n[13],m=n[14],d=n[15];return t[0]=i*(f*d-l*m)-M*(c*d-h*m)+b*(c*l-h*f),t[1]=-(r*(f*d-l*m)-M*(u*d-e*m)+b*(u*l-e*f)),t[2]=r*(c*d-h*m)-i*(u*d-e*m)+b*(u*h-e*c),t[3]=-(r*(c*l-h*f)-i*(u*l-e*f)+M*(u*h-e*c)),t[4]=-(o*(f*d-l*m)-s*(c*d-h*m)+v*(c*l-h*f)),t[5]=a*(f*d-l*m)-s*(u*d-e*m)+v*(u*l-e*f),t[6]=-(a*(c*d-h*m)-o*(u*d-e*m)+v*(u*h-e*c)),t[7]=a*(c*l-h*f)-o*(u*l-e*f)+s*(u*h-e*c),t[8]=o*(M*d-l*b)-s*(i*d-h*b)+v*(i*l-h*M),t[9]=-(a*(M*d-l*b)-s*(r*d-e*b)+v*(r*l-e*M)),t[10]=a*(i*d-h*b)-o*(r*d-e*b)+v*(r*h-e*i),t[11]=-(a*(i*l-h*M)-o*(r*l-e*M)+s*(r*h-e*i)),t[12]=-(o*(M*m-f*b)-s*(i*m-c*b)+v*(i*f-c*M)),t[13]=a*(M*m-f*b)-s*(r*m-u*b)+v*(r*f-u*M),t[14]=-(a*(i*m-c*b)-o*(r*m-u*b)+v*(r*c-u*i)),t[15]=a*(i*f-c*M)-o*(r*f-u*M)+s*(r*c-u*i),t},determinant:function(t){var n=t[0],a=t[1],r=t[2],u=t[3],e=t[4],o=t[5],i=t[6],c=t[7],h=t[8],s=t[9],M=t[10],f=t[11],l=t[12],v=t[13],b=t[14],m=t[15];return(n*o-a*e)*(M*m-f*b)-(n*i-r*e)*(s*m-f*v)+(n*c-u*e)*(s*b-M*v)+(a*i-r*o)*(h*m-f*l)-(a*c-u*o)*(h*b-M*l)+(r*c-u*i)*(h*v-s*l)},multiply:A,translate:function(t,n,a){var r,u,e,o,i,c,h,s,M,f,l,v,b=a[0],m=a[1],d=a[2];return n===t?(t[12]=n[0]*b+n[4]*m+n[8]*d+n[12],t[13]=n[1]*b+n[5]*m+n[9]*d+n[13],t[14]=n[2]*b+n[6]*m+n[10]*d+n[14],t[15]=n[3]*b+n[7]*m+n[11]*d+n[15]):(r=n[0],u=n[1],e=n[2],o=n[3],i=n[4],c=n[5],h=n[6],s=n[7],M=n[8],f=n[9],l=n[10],v=n[11],t[0]=r,t[1]=u,t[2]=e,t[3]=o,t[4]=i,t[5]=c,t[6]=h,t[7]=s,t[8]=M,t[9]=f,t[10]=l,t[11]=v,t[12]=r*b+i*m+M*d+n[12],t[13]=u*b+c*m+f*d+n[13],t[14]=e*b+h*m+l*d+n[14],t[15]=o*b+s*m+v*d+n[15]),t},scale:function(t,n,a){var r=a[0],u=a[1],e=a[2];return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=n[3]*r,t[4]=n[4]*u,t[5]=n[5]*u,t[6]=n[6]*u,t[7]=n[7]*u,t[8]=n[8]*e,t[9]=n[9]*e,t[10]=n[10]*e,t[11]=n[11]*e,t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],t},rotate:function(t,a,r,u){var e,o,i,c,h,s,M,f,l,v,b,m,d,x,p,y,q,g,A,w,R,z,P,j,I=u[0],S=u[1],E=u[2],O=Math.hypot(I,S,E);return O<n?null:(I*=O=1/O,S*=O,E*=O,e=Math.sin(r),i=1-(o=Math.cos(r)),c=a[0],h=a[1],s=a[2],M=a[3],f=a[4],l=a[5],v=a[6],b=a[7],m=a[8],d=a[9],x=a[10],p=a[11],y=I*I*i+o,q=S*I*i+E*e,g=E*I*i-S*e,A=I*S*i-E*e,w=S*S*i+o,R=E*S*i+I*e,z=I*E*i+S*e,P=S*E*i-I*e,j=E*E*i+o,t[0]=c*y+f*q+m*g,t[1]=h*y+l*q+d*g,t[2]=s*y+v*q+x*g,t[3]=M*y+b*q+p*g,t[4]=c*A+f*w+m*R,t[5]=h*A+l*w+d*R,t[6]=s*A+v*w+x*R,t[7]=M*A+b*w+p*R,t[8]=c*z+f*P+m*j,t[9]=h*z+l*P+d*j,t[10]=s*z+v*P+x*j,t[11]=M*z+b*P+p*j,a!==t&&(t[12]=a[12],t[13]=a[13],t[14]=a[14],t[15]=a[15]),t)},rotateX:function(t,n,a){var r=Math.sin(a),u=Math.cos(a),e=n[4],o=n[5],i=n[6],c=n[7],h=n[8],s=n[9],M=n[10],f=n[11];return n!==t&&(t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15]),t[4]=e*u+h*r,t[5]=o*u+s*r,t[6]=i*u+M*r,t[7]=c*u+f*r,t[8]=h*u-e*r,t[9]=s*u-o*r,t[10]=M*u-i*r,t[11]=f*u-c*r,t},rotateY:function(t,n,a){var r=Math.sin(a),u=Math.cos(a),e=n[0],o=n[1],i=n[2],c=n[3],h=n[8],s=n[9],M=n[10],f=n[11];return n!==t&&(t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15]),t[0]=e*u-h*r,t[1]=o*u-s*r,t[2]=i*u-M*r,t[3]=c*u-f*r,t[8]=e*r+h*u,t[9]=o*r+s*u,t[10]=i*r+M*u,t[11]=c*r+f*u,t},rotateZ:function(t,n,a){var r=Math.sin(a),u=Math.cos(a),e=n[0],o=n[1],i=n[2],c=n[3],h=n[4],s=n[5],M=n[6],f=n[7];return n!==t&&(t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15]),t[0]=e*u+h*r,t[1]=o*u+s*r,t[2]=i*u+M*r,t[3]=c*u+f*r,t[4]=h*u-e*r,t[5]=s*u-o*r,t[6]=M*u-i*r,t[7]=f*u-c*r,t},fromTranslation:function(t,n){return t[0]=1,t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=1,t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[10]=1,t[11]=0,t[12]=n[0],t[13]=n[1],t[14]=n[2],t[15]=1,t},fromScaling:function(t,n){return t[0]=n[0],t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=n[1],t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[10]=n[2],t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,t},fromRotation:function(t,a,r){var u,e,o,i=r[0],c=r[1],h=r[2],s=Math.hypot(i,c,h);return s<n?null:(i*=s=1/s,c*=s,h*=s,u=Math.sin(a),o=1-(e=Math.cos(a)),t[0]=i*i*o+e,t[1]=c*i*o+h*u,t[2]=h*i*o-c*u,t[3]=0,t[4]=i*c*o-h*u,t[5]=c*c*o+e,t[6]=h*c*o+i*u,t[7]=0,t[8]=i*h*o+c*u,t[9]=c*h*o-i*u,t[10]=h*h*o+e,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,t)},fromXRotation:function(t,n){var a=Math.sin(n),r=Math.cos(n);return t[0]=1,t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=r,t[6]=a,t[7]=0,t[8]=0,t[9]=-a,t[10]=r,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,t},fromYRotation:function(t,n){var a=Math.sin(n),r=Math.cos(n);return t[0]=r,t[1]=0,t[2]=-a,t[3]=0,t[4]=0,t[5]=1,t[6]=0,t[7]=0,t[8]=a,t[9]=0,t[10]=r,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,t},fromZRotation:function(t,n){var a=Math.sin(n),r=Math.cos(n);return t[0]=r,t[1]=a,t[2]=0,t[3]=0,t[4]=-a,t[5]=r,t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[10]=1,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,t},fromRotationTranslation:w,fromQuat2:function(t,n){var r=new a(3),u=-n[0],e=-n[1],o=-n[2],i=n[3],c=n[4],h=n[5],s=n[6],M=n[7],f=u*u+e*e+o*o+i*i;return f>0?(r[0]=2*(c*i+M*u+h*o-s*e)/f,r[1]=2*(h*i+M*e+s*u-c*o)/f,r[2]=2*(s*i+M*o+c*e-h*u)/f):(r[0]=2*(c*i+M*u+h*o-s*e),r[1]=2*(h*i+M*e+s*u-c*o),r[2]=2*(s*i+M*o+c*e-h*u)),w(t,n,r),t},getTranslation:R,getScaling:z,getRotation:P,fromRotationTranslationScale:function(t,n,a,r){var u=n[0],e=n[1],o=n[2],i=n[3],c=u+u,h=e+e,s=o+o,M=u*c,f=u*h,l=u*s,v=e*h,b=e*s,m=o*s,d=i*c,x=i*h,p=i*s,y=r[0],q=r[1],g=r[2];return t[0]=(1-(v+m))*y,t[1]=(f+p)*y,t[2]=(l-x)*y,t[3]=0,t[4]=(f-p)*q,t[5]=(1-(M+m))*q,t[6]=(b+d)*q,t[7]=0,t[8]=(l+x)*g,t[9]=(b-d)*g,t[10]=(1-(M+v))*g,t[11]=0,t[12]=a[0],t[13]=a[1],t[14]=a[2],t[15]=1,t},fromRotationTranslationScaleOrigin:function(t,n,a,r,u){var e=n[0],o=n[1],i=n[2],c=n[3],h=e+e,s=o+o,M=i+i,f=e*h,l=e*s,v=e*M,b=o*s,m=o*M,d=i*M,x=c*h,p=c*s,y=c*M,q=r[0],g=r[1],A=r[2],w=u[0],R=u[1],z=u[2],P=(1-(b+d))*q,j=(l+y)*q,I=(v-p)*q,S=(l-y)*g,E=(1-(f+d))*g,O=(m+x)*g,T=(v+p)*A,D=(m-x)*A,F=(1-(f+b))*A;return t[0]=P,t[1]=j,t[2]=I,t[3]=0,t[4]=S,t[5]=E,t[6]=O,t[7]=0,t[8]=T,t[9]=D,t[10]=F,t[11]=0,t[12]=a[0]+w-(P*w+S*R+T*z),t[13]=a[1]+R-(j*w+E*R+D*z),t[14]=a[2]+z-(I*w+O*R+F*z),t[15]=1,t},fromQuat:function(t,n){var a=n[0],r=n[1],u=n[2],e=n[3],o=a+a,i=r+r,c=u+u,h=a*o,s=r*o,M=r*i,f=u*o,l=u*i,v=u*c,b=e*o,m=e*i,d=e*c;return t[0]=1-M-v,t[1]=s+d,t[2]=f-m,t[3]=0,t[4]=s-d,t[5]=1-h-v,t[6]=l+b,t[7]=0,t[8]=f+m,t[9]=l-b,t[10]=1-h-M,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,t},frustum:function(t,n,a,r,u,e,o){var i=1/(a-n),c=1/(u-r),h=1/(e-o);return t[0]=2*e*i,t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=2*e*c,t[6]=0,t[7]=0,t[8]=(a+n)*i,t[9]=(u+r)*c,t[10]=(o+e)*h,t[11]=-1,t[12]=0,t[13]=0,t[14]=o*e*2*h,t[15]=0,t},perspective:function(t,n,a,r,u){var e,o=1/Math.tan(n/2);return t[0]=o/a,t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=o,t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[11]=-1,t[12]=0,t[13]=0,t[15]=0,null!=u&&u!==1/0?(e=1/(r-u),t[10]=(u+r)*e,t[14]=2*u*r*e):(t[10]=-1,t[14]=-2*r),t},perspectiveFromFieldOfView:function(t,n,a,r){var u=Math.tan(n.upDegrees*Math.PI/180),e=Math.tan(n.downDegrees*Math.PI/180),o=Math.tan(n.leftDegrees*Math.PI/180),i=Math.tan(n.rightDegrees*Math.PI/180),c=2/(o+i),h=2/(u+e);return t[0]=c,t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=h,t[6]=0,t[7]=0,t[8]=-(o-i)*c*.5,t[9]=(u-e)*h*.5,t[10]=r/(a-r),t[11]=-1,t[12]=0,t[13]=0,t[14]=r*a/(a-r),t[15]=0,t},ortho:function(t,n,a,r,u,e,o){var i=1/(n-a),c=1/(r-u),h=1/(e-o);return t[0]=-2*i,t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=-2*c,t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[10]=2*h,t[11]=0,t[12]=(n+a)*i,t[13]=(u+r)*c,t[14]=(o+e)*h,t[15]=1,t},lookAt:function(t,a,r,u){var e,o,i,c,h,s,M,f,l,v,b=a[0],m=a[1],d=a[2],x=u[0],p=u[1],y=u[2],q=r[0],A=r[1],w=r[2];return Math.abs(b-q)<n&&Math.abs(m-A)<n&&Math.abs(d-w)<n?g(t):(M=b-q,f=m-A,l=d-w,e=p*(l*=v=1/Math.hypot(M,f,l))-y*(f*=v),o=y*(M*=v)-x*l,i=x*f-p*M,(v=Math.hypot(e,o,i))?(e*=v=1/v,o*=v,i*=v):(e=0,o=0,i=0),c=f*i-l*o,h=l*e-M*i,s=M*o-f*e,(v=Math.hypot(c,h,s))?(c*=v=1/v,h*=v,s*=v):(c=0,h=0,s=0),t[0]=e,t[1]=c,t[2]=M,t[3]=0,t[4]=o,t[5]=h,t[6]=f,t[7]=0,t[8]=i,t[9]=s,t[10]=l,t[11]=0,t[12]=-(e*b+o*m+i*d),t[13]=-(c*b+h*m+s*d),t[14]=-(M*b+f*m+l*d),t[15]=1,t)},targetTo:function(t,n,a,r){var u=n[0],e=n[1],o=n[2],i=r[0],c=r[1],h=r[2],s=u-a[0],M=e-a[1],f=o-a[2],l=s*s+M*M+f*f;l>0&&(s*=l=1/Math.sqrt(l),M*=l,f*=l);var v=c*f-h*M,b=h*s-i*f,m=i*M-c*s;return(l=v*v+b*b+m*m)>0&&(v*=l=1/Math.sqrt(l),b*=l,m*=l),t[0]=v,t[1]=b,t[2]=m,t[3]=0,t[4]=M*m-f*b,t[5]=f*v-s*m,t[6]=s*b-M*v,t[7]=0,t[8]=s,t[9]=M,t[10]=f,t[11]=0,t[12]=u,t[13]=e,t[14]=o,t[15]=1,t},str:function(t){return"mat4("+t[0]+", "+t[1]+", "+t[2]+", "+t[3]+", "+t[4]+", "+t[5]+", "+t[6]+", "+t[7]+", "+t[8]+", "+t[9]+", "+t[10]+", "+t[11]+", "+t[12]+", "+t[13]+", "+t[14]+", "+t[15]+")"},frob:function(t){return Math.hypot(t[0],t[1],t[3],t[4],t[5],t[6],t[7],t[8],t[9],t[10],t[11],t[12],t[13],t[14],t[15])},add:function(t,n,a){return t[0]=n[0]+a[0],t[1]=n[1]+a[1],t[2]=n[2]+a[2],t[3]=n[3]+a[3],t[4]=n[4]+a[4],t[5]=n[5]+a[5],t[6]=n[6]+a[6],t[7]=n[7]+a[7],t[8]=n[8]+a[8],t[9]=n[9]+a[9],t[10]=n[10]+a[10],t[11]=n[11]+a[11],t[12]=n[12]+a[12],t[13]=n[13]+a[13],t[14]=n[14]+a[14],t[15]=n[15]+a[15],t},subtract:j,multiplyScalar:function(t,n,a){return t[0]=n[0]*a,t[1]=n[1]*a,t[2]=n[2]*a,t[3]=n[3]*a,t[4]=n[4]*a,t[5]=n[5]*a,t[6]=n[6]*a,t[7]=n[7]*a,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=n[11]*a,t[12]=n[12]*a,t[13]=n[13]*a,t[14]=n[14]*a,t[15]=n[15]*a,t},multiplyScalarAndAdd:function(t,n,a,r){return t[0]=n[0]+a[0]*r,t[1]=n[1]+a[1]*r,t[2]=n[2]+a[2]*r,t[3]=n[3]+a[3]*r,t[4]=n[4]+a[4]*r,t[5]=n[5]+a[5]*r,t[6]=n[6]+a[6]*r,t[7]=n[7]+a[7]*r,t[8]=n[8]+a[8]*r,t[9]=n[9]+a[9]*r,t[10]=n[10]+a[10]*r,t[11]=n[11]+a[11]*r,t[12]=n[12]+a[12]*r,t[13]=n[13]+a[13]*r,t[14]=n[14]+a[14]*r,t[15]=n[15]+a[15]*r,t},exactEquals:function(t,n){return t[0]===n[0]&&t[1]===n[1]&&t[2]===n[2]&&t[3]===n[3]&&t[4]===n[4]&&t[5]===n[5]&&t[6]===n[6]&&t[7]===n[7]&&t[8]===n[8]&&t[9]===n[9]&&t[10]===n[10]&&t[11]===n[11]&&t[12]===n[12]&&t[13]===n[13]&&t[14]===n[14]&&t[15]===n[15]},equals:function(t,a){var r=t[0],u=t[1],e=t[2],o=t[3],i=t[4],c=t[5],h=t[6],s=t[7],M=t[8],f=t[9],l=t[10],v=t[11],b=t[12],m=t[13],d=t[14],x=t[15],p=a[0],y=a[1],q=a[2],g=a[3],A=a[4],w=a[5],R=a[6],z=a[7],P=a[8],j=a[9],I=a[10],S=a[11],E=a[12],O=a[13],T=a[14],D=a[15];return Math.abs(r-p)<=n*Math.max(1,Math.abs(r),Math.abs(p))&&Math.abs(u-y)<=n*Math.max(1,Math.abs(u),Math.abs(y))&&Math.abs(e-q)<=n*Math.max(1,Math.abs(e),Math.abs(q))&&Math.abs(o-g)<=n*Math.max(1,Math.abs(o),Math.abs(g))&&Math.abs(i-A)<=n*Math.max(1,Math.abs(i),Math.abs(A))&&Math.abs(c-w)<=n*Math.max(1,Math.abs(c),Math.abs(w))&&Math.abs(h-R)<=n*Math.max(1,Math.abs(h),Math.abs(R))&&Math.abs(s-z)<=n*Math.max(1,Math.abs(s),Math.abs(z))&&Math.abs(M-P)<=n*Math.max(1,Math.abs(M),Math.abs(P))&&Math.abs(f-j)<=n*Math.max(1,Math.abs(f),Math.abs(j))&&Math.abs(l-I)<=n*Math.max(1,Math.abs(l),Math.abs(I))&&Math.abs(v-S)<=n*Math.max(1,Math.abs(v),Math.abs(S))&&Math.abs(b-E)<=n*Math.max(1,Math.abs(b),Math.abs(E))&&Math.abs(m-O)<=n*Math.max(1,Math.abs(m),Math.abs(O))&&Math.abs(d-T)<=n*Math.max(1,Math.abs(d),Math.abs(T))&&Math.abs(x-D)<=n*Math.max(1,Math.abs(x),Math.abs(D))},mul:I,sub:S});function O(){var t=new a(3);return a!=Float32Array&&(t[0]=0,t[1]=0,t[2]=0),t}function T(t){var n=t[0],a=t[1],r=t[2];return Math.hypot(n,a,r)}function D(t,n,r){var u=new a(3);return u[0]=t,u[1]=n,u[2]=r,u}function F(t,n,a){return t[0]=n[0]-a[0],t[1]=n[1]-a[1],t[2]=n[2]-a[2],t}function L(t,n,a){return t[0]=n[0]*a[0],t[1]=n[1]*a[1],t[2]=n[2]*a[2],t}function V(t,n,a){return t[0]=n[0]/a[0],t[1]=n[1]/a[1],t[2]=n[2]/a[2],t}function Q(t,n){var a=n[0]-t[0],r=n[1]-t[1],u=n[2]-t[2];return Math.hypot(a,r,u)}function Y(t,n){var a=n[0]-t[0],r=n[1]-t[1],u=n[2]-t[2];return a*a+r*r+u*u}function X(t){var n=t[0],a=t[1],r=t[2];return n*n+a*a+r*r}function Z(t,n){var a=n[0],r=n[1],u=n[2],e=a*a+r*r+u*u;return e>0&&(e=1/Math.sqrt(e)),t[0]=n[0]*e,t[1]=n[1]*e,t[2]=n[2]*e,t}function _(t,n){return t[0]*n[0]+t[1]*n[1]+t[2]*n[2]}function B(t,n,a){var r=n[0],u=n[1],e=n[2],o=a[0],i=a[1],c=a[2];return t[0]=u*c-e*i,t[1]=e*o-r*c,t[2]=r*i-u*o,t}var N,k=F,U=L,W=V,C=Q,G=Y,H=T,J=X,K=(N=O(),function(t,n,a,r,u,e){var o,i;for(n||(n=3),a||(a=0),i=r?Math.min(r*n+a,t.length):t.length,o=a;o<i;o+=n)N[0]=t[o],N[1]=t[o+1],N[2]=t[o+2],u(N,N,e),t[o]=N[0],t[o+1]=N[1],t[o+2]=N[2];return t}),$=Object.freeze({create:O,clone:function(t){var n=new a(3);return n[0]=t[0],n[1]=t[1],n[2]=t[2],n},length:T,fromValues:D,copy:function(t,n){return t[0]=n[0],t[1]=n[1],t[2]=n[2],t},set:function(t,n,a,r){return t[0]=n,t[1]=a,t[2]=r,t},add:function(t,n,a){return t[0]=n[0]+a[0],t[1]=n[1]+a[1],t[2]=n[2]+a[2],t},subtract:F,multiply:L,divide:V,ceil:function(t,n){return t[0]=Math.ceil(n[0]),t[1]=Math.ceil(n[1]),t[2]=Math.ceil(n[2]),t},floor:function(t,n){return t[0]=Math.floor(n[0]),t[1]=Math.floor(n[1]),t[2]=Math.floor(n[2]),t},min:function(t,n,a){return t[0]=Math.min(n[0],a[0]),t[1]=Math.min(n[1],a[1]),t[2]=Math.min(n[2],a[2]),t},max:function(t,n,a){return t[0]=Math.max(n[0],a[0]),t[1]=Math.max(n[1],a[1]),t[2]=Math.max(n[2],a[2]),t},round:function(t,n){return t[0]=Math.round(n[0]),t[1]=Math.round(n[1]),t[2]=Math.round(n[2]),t},scale:function(t,n,a){return t[0]=n[0]*a,t[1]=n[1]*a,t[2]=n[2]*a,t},scaleAndAdd:function(t,n,a,r){return t[0]=n[0]+a[0]*r,t[1]=n[1]+a[1]*r,t[2]=n[2]+a[2]*r,t},distance:Q,squaredDistance:Y,squaredLength:X,negate:function(t,n){return t[0]=-n[0],t[1]=-n[1],t[2]=-n[2],t},inverse:function(t,n){return t[0]=1/n[0],t[1]=1/n[1],t[2]=1/n[2],t},normalize:Z,dot:_,cross:B,lerp:function(t,n,a,r){var u=n[0],e=n[1],o=n[2];return t[0]=u+r*(a[0]-u),t[1]=e+r*(a[1]-e),t[2]=o+r*(a[2]-o),t},hermite:function(t,n,a,r,u,e){var o=e*e,i=o*(2*e-3)+1,c=o*(e-2)+e,h=o*(e-1),s=o*(3-2*e);return t[0]=n[0]*i+a[0]*c+r[0]*h+u[0]*s,t[1]=n[1]*i+a[1]*c+r[1]*h+u[1]*s,t[2]=n[2]*i+a[2]*c+r[2]*h+u[2]*s,t},bezier:function(t,n,a,r,u,e){var o=1-e,i=o*o,c=e*e,h=i*o,s=3*e*i,M=3*c*o,f=c*e;return t[0]=n[0]*h+a[0]*s+r[0]*M+u[0]*f,t[1]=n[1]*h+a[1]*s+r[1]*M+u[1]*f,t[2]=n[2]*h+a[2]*s+r[2]*M+u[2]*f,t},random:function(t,n){n=n||1;var a=2*r()*Math.PI,u=2*r()-1,e=Math.sqrt(1-u*u)*n;return t[0]=Math.cos(a)*e,t[1]=Math.sin(a)*e,t[2]=u*n,t},transformMat4:function(t,n,a){var r=n[0],u=n[1],e=n[2],o=a[3]*r+a[7]*u+a[11]*e+a[15];return o=o||1,t[0]=(a[0]*r+a[4]*u+a[8]*e+a[12])/o,t[1]=(a[1]*r+a[5]*u+a[9]*e+a[13])/o,t[2]=(a[2]*r+a[6]*u+a[10]*e+a[14])/o,t},transformMat3:function(t,n,a){var r=n[0],u=n[1],e=n[2];return t[0]=r*a[0]+u*a[3]+e*a[6],t[1]=r*a[1]+u*a[4]+e*a[7],t[2]=r*a[2]+u*a[5]+e*a[8],t},transformQuat:function(t,n,a){var r=a[0],u=a[1],e=a[2],o=a[3],i=n[0],c=n[1],h=n[2],s=u*h-e*c,M=e*i-r*h,f=r*c-u*i,l=u*f-e*M,v=e*s-r*f,b=r*M-u*s,m=2*o;return s*=m,M*=m,f*=m,l*=2,v*=2,b*=2,t[0]=i+s+l,t[1]=c+M+v,t[2]=h+f+b,t},rotateX:function(t,n,a,r){var u=[],e=[];return u[0]=n[0]-a[0],u[1]=n[1]-a[1],u[2]=n[2]-a[2],e[0]=u[0],e[1]=u[1]*Math.cos(r)-u[2]*Math.sin(r),e[2]=u[1]*Math.sin(r)+u[2]*Math.cos(r),t[0]=e[0]+a[0],t[1]=e[1]+a[1],t[2]=e[2]+a[2],t},rotateY:function(t,n,a,r){var u=[],e=[];return u[0]=n[0]-a[0],u[1]=n[1]-a[1],u[2]=n[2]-a[2],e[0]=u[2]*Math.sin(r)+u[0]*Math.cos(r),e[1]=u[1],e[2]=u[2]*Math.cos(r)-u[0]*Math.sin(r),t[0]=e[0]+a[0],t[1]=e[1]+a[1],t[2]=e[2]+a[2],t},rotateZ:function(t,n,a,r){var u=[],e=[];return u[0]=n[0]-a[0],u[1]=n[1]-a[1],u[2]=n[2]-a[2],e[0]=u[0]*Math.cos(r)-u[1]*Math.sin(r),e[1]=u[0]*Math.sin(r)+u[1]*Math.cos(r),e[2]=u[2],t[0]=e[0]+a[0],t[1]=e[1]+a[1],t[2]=e[2]+a[2],t},angle:function(t,n){var a=D(t[0],t[1],t[2]),r=D(n[0],n[1],n[2]);Z(a,a),Z(r,r);var u=_(a,r);return u>1?0:u<-1?Math.PI:Math.acos(u)},zero:function(t){return t[0]=0,t[1]=0,t[2]=0,t},str:function(t){return"vec3("+t[0]+", "+t[1]+", "+t[2]+")"},exactEquals:function(t,n){return t[0]===n[0]&&t[1]===n[1]&&t[2]===n[2]},equals:function(t,a){var r=t[0],u=t[1],e=t[2],o=a[0],i=a[1],c=a[2];return Math.abs(r-o)<=n*Math.max(1,Math.abs(r),Math.abs(o))&&Math.abs(u-i)<=n*Math.max(1,Math.abs(u),Math.abs(i))&&Math.abs(e-c)<=n*Math.max(1,Math.abs(e),Math.abs(c))},sub:k,mul:U,div:W,dist:C,sqrDist:G,len:H,sqrLen:J,forEach:K});function tt(){var t=new a(4);return a!=Float32Array&&(t[0]=0,t[1]=0,t[2]=0,t[3]=0),t}function nt(t){var n=new a(4);return n[0]=t[0],n[1]=t[1],n[2]=t[2],n[3]=t[3],n}function at(t,n,r,u){var e=new a(4);return e[0]=t,e[1]=n,e[2]=r,e[3]=u,e}function rt(t,n){return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t}function ut(t,n,a,r,u){return t[0]=n,t[1]=a,t[2]=r,t[3]=u,t}function et(t,n,a){return t[0]=n[0]+a[0],t[1]=n[1]+a[1],t[2]=n[2]+a[2],t[3]=n[3]+a[3],t}function ot(t,n,a){return t[0]=n[0]-a[0],t[1]=n[1]-a[1],t[2]=n[2]-a[2],t[3]=n[3]-a[3],t}function it(t,n,a){return t[0]=n[0]*a[0],t[1]=n[1]*a[1],t[2]=n[2]*a[2],t[3]=n[3]*a[3],t}function ct(t,n,a){return t[0]=n[0]/a[0],t[1]=n[1]/a[1],t[2]=n[2]/a[2],t[3]=n[3]/a[3],t}function ht(t,n,a){return t[0]=n[0]*a,t[1]=n[1]*a,t[2]=n[2]*a,t[3]=n[3]*a,t}function st(t,n){var a=n[0]-t[0],r=n[1]-t[1],u=n[2]-t[2],e=n[3]-t[3];return Math.hypot(a,r,u,e)}function Mt(t,n){var a=n[0]-t[0],r=n[1]-t[1],u=n[2]-t[2],e=n[3]-t[3];return a*a+r*r+u*u+e*e}function ft(t){var n=t[0],a=t[1],r=t[2],u=t[3];return Math.hypot(n,a,r,u)}function lt(t){var n=t[0],a=t[1],r=t[2],u=t[3];return n*n+a*a+r*r+u*u}function vt(t,n){var a=n[0],r=n[1],u=n[2],e=n[3],o=a*a+r*r+u*u+e*e;return o>0&&(o=1/Math.sqrt(o)),t[0]=a*o,t[1]=r*o,t[2]=u*o,t[3]=e*o,t}function bt(t,n){return t[0]*n[0]+t[1]*n[1]+t[2]*n[2]+t[3]*n[3]}function mt(t,n,a,r){var u=n[0],e=n[1],o=n[2],i=n[3];return t[0]=u+r*(a[0]-u),t[1]=e+r*(a[1]-e),t[2]=o+r*(a[2]-o),t[3]=i+r*(a[3]-i),t}function dt(t,n){return t[0]===n[0]&&t[1]===n[1]&&t[2]===n[2]&&t[3]===n[3]}function xt(t,a){var r=t[0],u=t[1],e=t[2],o=t[3],i=a[0],c=a[1],h=a[2],s=a[3];return Math.abs(r-i)<=n*Math.max(1,Math.abs(r),Math.abs(i))&&Math.abs(u-c)<=n*Math.max(1,Math.abs(u),Math.abs(c))&&Math.abs(e-h)<=n*Math.max(1,Math.abs(e),Math.abs(h))&&Math.abs(o-s)<=n*Math.max(1,Math.abs(o),Math.abs(s))}var pt=ot,yt=it,qt=ct,gt=st,At=Mt,wt=ft,Rt=lt,zt=function(){var t=tt();return function(n,a,r,u,e,o){var i,c;for(a||(a=4),r||(r=0),c=u?Math.min(u*a+r,n.length):n.length,i=r;i<c;i+=a)t[0]=n[i],t[1]=n[i+1],t[2]=n[i+2],t[3]=n[i+3],e(t,t,o),n[i]=t[0],n[i+1]=t[1],n[i+2]=t[2],n[i+3]=t[3];return n}}(),Pt=Object.freeze({create:tt,clone:nt,fromValues:at,copy:rt,set:ut,add:et,subtract:ot,multiply:it,divide:ct,ceil:function(t,n){return t[0]=Math.ceil(n[0]),t[1]=Math.ceil(n[1]),t[2]=Math.ceil(n[2]),t[3]=Math.ceil(n[3]),t},floor:function(t,n){return t[0]=Math.floor(n[0]),t[1]=Math.floor(n[1]),t[2]=Math.floor(n[2]),t[3]=Math.floor(n[3]),t},min:function(t,n,a){return t[0]=Math.min(n[0],a[0]),t[1]=Math.min(n[1],a[1]),t[2]=Math.min(n[2],a[2]),t[3]=Math.min(n[3],a[3]),t},max:function(t,n,a){return t[0]=Math.max(n[0],a[0]),t[1]=Math.max(n[1],a[1]),t[2]=Math.max(n[2],a[2]),t[3]=Math.max(n[3],a[3]),t},round:function(t,n){return t[0]=Math.round(n[0]),t[1]=Math.round(n[1]),t[2]=Math.round(n[2]),t[3]=Math.round(n[3]),t},scale:ht,scaleAndAdd:function(t,n,a,r){return t[0]=n[0]+a[0]*r,t[1]=n[1]+a[1]*r,t[2]=n[2]+a[2]*r,t[3]=n[3]+a[3]*r,t},distance:st,squaredDistance:Mt,length:ft,squaredLength:lt,negate:function(t,n){return t[0]=-n[0],t[1]=-n[1],t[2]=-n[2],t[3]=-n[3],t},inverse:function(t,n){return t[0]=1/n[0],t[1]=1/n[1],t[2]=1/n[2],t[3]=1/n[3],t},normalize:vt,dot:bt,cross:function(t,n,a,r){var u=a[0]*r[1]-a[1]*r[0],e=a[0]*r[2]-a[2]*r[0],o=a[0]*r[3]-a[3]*r[0],i=a[1]*r[2]-a[2]*r[1],c=a[1]*r[3]-a[3]*r[1],h=a[2]*r[3]-a[3]*r[2],s=n[0],M=n[1],f=n[2],l=n[3];return t[0]=M*h-f*c+l*i,t[1]=-s*h+f*o-l*e,t[2]=s*c-M*o+l*u,t[3]=-s*i+M*e-f*u,t},lerp:mt,random:function(t,n){var a,u,e,o,i,c;n=n||1;do{i=(a=2*r()-1)*a+(u=2*r()-1)*u}while(i>=1);do{c=(e=2*r()-1)*e+(o=2*r()-1)*o}while(c>=1);var h=Math.sqrt((1-i)/c);return t[0]=n*a,t[1]=n*u,t[2]=n*e*h,t[3]=n*o*h,t},transformMat4:function(t,n,a){var r=n[0],u=n[1],e=n[2],o=n[3];return t[0]=a[0]*r+a[4]*u+a[8]*e+a[12]*o,t[1]=a[1]*r+a[5]*u+a[9]*e+a[13]*o,t[2]=a[2]*r+a[6]*u+a[10]*e+a[14]*o,t[3]=a[3]*r+a[7]*u+a[11]*e+a[15]*o,t},transformQuat:function(t,n,a){var r=n[0],u=n[1],e=n[2],o=a[0],i=a[1],c=a[2],h=a[3],s=h*r+i*e-c*u,M=h*u+c*r-o*e,f=h*e+o*u-i*r,l=-o*r-i*u-c*e;return t[0]=s*h+l*-o+M*-c-f*-i,t[1]=M*h+l*-i+f*-o-s*-c,t[2]=f*h+l*-c+s*-i-M*-o,t[3]=n[3],t},zero:function(t){return t[0]=0,t[1]=0,t[2]=0,t[3]=0,t},str:function(t){return"vec4("+t[0]+", "+t[1]+", "+t[2]+", "+t[3]+")"},exactEquals:dt,equals:xt,sub:pt,mul:yt,div:qt,dist:gt,sqrDist:At,len:wt,sqrLen:Rt,forEach:zt});function jt(){var t=new a(4);return a!=Float32Array&&(t[0]=0,t[1]=0,t[2]=0),t[3]=1,t}function It(t,n,a){a*=.5;var r=Math.sin(a);return t[0]=r*n[0],t[1]=r*n[1],t[2]=r*n[2],t[3]=Math.cos(a),t}function St(t,n,a){var r=n[0],u=n[1],e=n[2],o=n[3],i=a[0],c=a[1],h=a[2],s=a[3];return t[0]=r*s+o*i+u*h-e*c,t[1]=u*s+o*c+e*i-r*h,t[2]=e*s+o*h+r*c-u*i,t[3]=o*s-r*i-u*c-e*h,t}function Et(t,n,a){a*=.5;var r=n[0],u=n[1],e=n[2],o=n[3],i=Math.sin(a),c=Math.cos(a);return t[0]=r*c+o*i,t[1]=u*c+e*i,t[2]=e*c-u*i,t[3]=o*c-r*i,t}function Ot(t,n,a){a*=.5;var r=n[0],u=n[1],e=n[2],o=n[3],i=Math.sin(a),c=Math.cos(a);return t[0]=r*c-e*i,t[1]=u*c+o*i,t[2]=e*c+r*i,t[3]=o*c-u*i,t}function Tt(t,n,a){a*=.5;var r=n[0],u=n[1],e=n[2],o=n[3],i=Math.sin(a),c=Math.cos(a);return t[0]=r*c+u*i,t[1]=u*c-r*i,t[2]=e*c+o*i,t[3]=o*c-e*i,t}function Dt(t,a,r,u){var e,o,i,c,h,s=a[0],M=a[1],f=a[2],l=a[3],v=r[0],b=r[1],m=r[2],d=r[3];return(o=s*v+M*b+f*m+l*d)<0&&(o=-o,v=-v,b=-b,m=-m,d=-d),1-o>n?(e=Math.acos(o),i=Math.sin(e),c=Math.sin((1-u)*e)/i,h=Math.sin(u*e)/i):(c=1-u,h=u),t[0]=c*s+h*v,t[1]=c*M+h*b,t[2]=c*f+h*m,t[3]=c*l+h*d,t}function Ft(t,n){var a,r=n[0]+n[4]+n[8];if(r>0)a=Math.sqrt(r+1),t[3]=.5*a,a=.5/a,t[0]=(n[5]-n[7])*a,t[1]=(n[6]-n[2])*a,t[2]=(n[1]-n[3])*a;else{var u=0;n[4]>n[0]&&(u=1),n[8]>n[3*u+u]&&(u=2);var e=(u+1)%3,o=(u+2)%3;a=Math.sqrt(n[3*u+u]-n[3*e+e]-n[3*o+o]+1),t[u]=.5*a,a=.5/a,t[3]=(n[3*e+o]-n[3*o+e])*a,t[e]=(n[3*e+u]+n[3*u+e])*a,t[o]=(n[3*o+u]+n[3*u+o])*a}return t}var Lt,Vt,Qt,Yt,Xt,Zt,_t=nt,Bt=at,Nt=rt,kt=ut,Ut=et,Wt=St,Ct=ht,Gt=bt,Ht=mt,Jt=ft,Kt=Jt,$t=lt,tn=$t,nn=vt,an=dt,rn=xt,un=(Lt=O(),Vt=D(1,0,0),Qt=D(0,1,0),function(t,n,a){var r=_(n,a);return r<-.999999?(B(Lt,Vt,n),H(Lt)<1e-6&&B(Lt,Qt,n),Z(Lt,Lt),It(t,Lt,Math.PI),t):r>.999999?(t[0]=0,t[1]=0,t[2]=0,t[3]=1,t):(B(Lt,n,a),t[0]=Lt[0],t[1]=Lt[1],t[2]=Lt[2],t[3]=1+r,nn(t,t))}),en=(Yt=jt(),Xt=jt(),function(t,n,a,r,u,e){return Dt(Yt,n,u,e),Dt(Xt,a,r,e),Dt(t,Yt,Xt,2*e*(1-e)),t}),on=(Zt=m(),function(t,n,a,r){return Zt[0]=a[0],Zt[3]=a[1],Zt[6]=a[2],Zt[1]=r[0],Zt[4]=r[1],Zt[7]=r[2],Zt[2]=-n[0],Zt[5]=-n[1],Zt[8]=-n[2],nn(t,Ft(t,Zt))}),cn=Object.freeze({create:jt,identity:function(t){return t[0]=0,t[1]=0,t[2]=0,t[3]=1,t},setAxisAngle:It,getAxisAngle:function(t,a){var r=2*Math.acos(a[3]),u=Math.sin(r/2);return u>n?(t[0]=a[0]/u,t[1]=a[1]/u,t[2]=a[2]/u):(t[0]=1,t[1]=0,t[2]=0),r},multiply:St,rotateX:Et,rotateY:Ot,rotateZ:Tt,calculateW:function(t,n){var a=n[0],r=n[1],u=n[2];return t[0]=a,t[1]=r,t[2]=u,t[3]=Math.sqrt(Math.abs(1-a*a-r*r-u*u)),t},slerp:Dt,random:function(t){var n=r(),a=r(),u=r(),e=Math.sqrt(1-n),o=Math.sqrt(n);return t[0]=e*Math.sin(2*Math.PI*a),t[1]=e*Math.cos(2*Math.PI*a),t[2]=o*Math.sin(2*Math.PI*u),t[3]=o*Math.cos(2*Math.PI*u),t},invert:function(t,n){var a=n[0],r=n[1],u=n[2],e=n[3],o=a*a+r*r+u*u+e*e,i=o?1/o:0;return t[0]=-a*i,t[1]=-r*i,t[2]=-u*i,t[3]=e*i,t},conjugate:function(t,n){return t[0]=-n[0],t[1]=-n[1],t[2]=-n[2],t[3]=n[3],t},fromMat3:Ft,fromEuler:function(t,n,a,r){var u=.5*Math.PI/180;n*=u,a*=u,r*=u;var e=Math.sin(n),o=Math.cos(n),i=Math.sin(a),c=Math.cos(a),h=Math.sin(r),s=Math.cos(r);return t[0]=e*c*s-o*i*h,t[1]=o*i*s+e*c*h,t[2]=o*c*h-e*i*s,t[3]=o*c*s+e*i*h,t},str:function(t){return"quat("+t[0]+", "+t[1]+", "+t[2]+", "+t[3]+")"},clone:_t,fromValues:Bt,copy:Nt,set:kt,add:Ut,mul:Wt,scale:Ct,dot:Gt,lerp:Ht,length:Jt,len:Kt,squaredLength:$t,sqrLen:tn,normalize:nn,exactEquals:an,equals:rn,rotationTo:un,sqlerp:en,setAxes:on});function hn(t,n,a){var r=.5*a[0],u=.5*a[1],e=.5*a[2],o=n[0],i=n[1],c=n[2],h=n[3];return t[0]=o,t[1]=i,t[2]=c,t[3]=h,t[4]=r*h+u*c-e*i,t[5]=u*h+e*o-r*c,t[6]=e*h+r*i-u*o,t[7]=-r*o-u*i-e*c,t}function sn(t,n){return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t}var Mn=Nt;var fn=Nt;function ln(t,n,a){var r=n[0],u=n[1],e=n[2],o=n[3],i=a[4],c=a[5],h=a[6],s=a[7],M=n[4],f=n[5],l=n[6],v=n[7],b=a[0],m=a[1],d=a[2],x=a[3];return t[0]=r*x+o*b+u*d-e*m,t[1]=u*x+o*m+e*b-r*d,t[2]=e*x+o*d+r*m-u*b,t[3]=o*x-r*b-u*m-e*d,t[4]=r*s+o*i+u*h-e*c+M*x+v*b+f*d-l*m,t[5]=u*s+o*c+e*i-r*h+f*x+v*m+l*b-M*d,t[6]=e*s+o*h+r*c-u*i+l*x+v*d+M*m-f*b,t[7]=o*s-r*i-u*c-e*h+v*x-M*b-f*m-l*d,t}var vn=ln;var bn=Gt;var mn=Jt,dn=mn,xn=$t,pn=xn;var yn=Object.freeze({create:function(){var t=new a(8);return a!=Float32Array&&(t[0]=0,t[1]=0,t[2]=0,t[4]=0,t[5]=0,t[6]=0,t[7]=0),t[3]=1,t},clone:function(t){var n=new a(8);return n[0]=t[0],n[1]=t[1],n[2]=t[2],n[3]=t[3],n[4]=t[4],n[5]=t[5],n[6]=t[6],n[7]=t[7],n},fromValues:function(t,n,r,u,e,o,i,c){var h=new a(8);return h[0]=t,h[1]=n,h[2]=r,h[3]=u,h[4]=e,h[5]=o,h[6]=i,h[7]=c,h},fromRotationTranslationValues:function(t,n,r,u,e,o,i){var c=new a(8);c[0]=t,c[1]=n,c[2]=r,c[3]=u;var h=.5*e,s=.5*o,M=.5*i;return c[4]=h*u+s*r-M*n,c[5]=s*u+M*t-h*r,c[6]=M*u+h*n-s*t,c[7]=-h*t-s*n-M*r,c},fromRotationTranslation:hn,fromTranslation:function(t,n){return t[0]=0,t[1]=0,t[2]=0,t[3]=1,t[4]=.5*n[0],t[5]=.5*n[1],t[6]=.5*n[2],t[7]=0,t},fromRotation:function(t,n){return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=0,t[5]=0,t[6]=0,t[7]=0,t},fromMat4:function(t,n){var r=jt();P(r,n);var u=new a(3);return R(u,n),hn(t,r,u),t},copy:sn,identity:function(t){return t[0]=0,t[1]=0,t[2]=0,t[3]=1,t[4]=0,t[5]=0,t[6]=0,t[7]=0,t},set:function(t,n,a,r,u,e,o,i,c){return t[0]=n,t[1]=a,t[2]=r,t[3]=u,t[4]=e,t[5]=o,t[6]=i,t[7]=c,t},getReal:Mn,getDual:function(t,n){return t[0]=n[4],t[1]=n[5],t[2]=n[6],t[3]=n[7],t},setReal:fn,setDual:function(t,n){return t[4]=n[0],t[5]=n[1],t[6]=n[2],t[7]=n[3],t},getTranslation:function(t,n){var a=n[4],r=n[5],u=n[6],e=n[7],o=-n[0],i=-n[1],c=-n[2],h=n[3];return t[0]=2*(a*h+e*o+r*c-u*i),t[1]=2*(r*h+e*i+u*o-a*c),t[2]=2*(u*h+e*c+a*i-r*o),t},translate:function(t,n,a){var r=n[0],u=n[1],e=n[2],o=n[3],i=.5*a[0],c=.5*a[1],h=.5*a[2],s=n[4],M=n[5],f=n[6],l=n[7];return t[0]=r,t[1]=u,t[2]=e,t[3]=o,t[4]=o*i+u*h-e*c+s,t[5]=o*c+e*i-r*h+M,t[6]=o*h+r*c-u*i+f,t[7]=-r*i-u*c-e*h+l,t},rotateX:function(t,n,a){var r=-n[0],u=-n[1],e=-n[2],o=n[3],i=n[4],c=n[5],h=n[6],s=n[7],M=i*o+s*r+c*e-h*u,f=c*o+s*u+h*r-i*e,l=h*o+s*e+i*u-c*r,v=s*o-i*r-c*u-h*e;return Et(t,n,a),r=t[0],u=t[1],e=t[2],o=t[3],t[4]=M*o+v*r+f*e-l*u,t[5]=f*o+v*u+l*r-M*e,t[6]=l*o+v*e+M*u-f*r,t[7]=v*o-M*r-f*u-l*e,t},rotateY:function(t,n,a){var r=-n[0],u=-n[1],e=-n[2],o=n[3],i=n[4],c=n[5],h=n[6],s=n[7],M=i*o+s*r+c*e-h*u,f=c*o+s*u+h*r-i*e,l=h*o+s*e+i*u-c*r,v=s*o-i*r-c*u-h*e;return Ot(t,n,a),r=t[0],u=t[1],e=t[2],o=t[3],t[4]=M*o+v*r+f*e-l*u,t[5]=f*o+v*u+l*r-M*e,t[6]=l*o+v*e+M*u-f*r,t[7]=v*o-M*r-f*u-l*e,t},rotateZ:function(t,n,a){var r=-n[0],u=-n[1],e=-n[2],o=n[3],i=n[4],c=n[5],h=n[6],s=n[7],M=i*o+s*r+c*e-h*u,f=c*o+s*u+h*r-i*e,l=h*o+s*e+i*u-c*r,v=s*o-i*r-c*u-h*e;return Tt(t,n,a),r=t[0],u=t[1],e=t[2],o=t[3],t[4]=M*o+v*r+f*e-l*u,t[5]=f*o+v*u+l*r-M*e,t[6]=l*o+v*e+M*u-f*r,t[7]=v*o-M*r-f*u-l*e,t},rotateByQuatAppend:function(t,n,a){var r=a[0],u=a[1],e=a[2],o=a[3],i=n[0],c=n[1],h=n[2],s=n[3];return t[0]=i*o+s*r+c*e-h*u,t[1]=c*o+s*u+h*r-i*e,t[2]=h*o+s*e+i*u-c*r,t[3]=s*o-i*r-c*u-h*e,i=n[4],c=n[5],h=n[6],s=n[7],t[4]=i*o+s*r+c*e-h*u,t[5]=c*o+s*u+h*r-i*e,t[6]=h*o+s*e+i*u-c*r,t[7]=s*o-i*r-c*u-h*e,t},rotateByQuatPrepend:function(t,n,a){var r=n[0],u=n[1],e=n[2],o=n[3],i=a[0],c=a[1],h=a[2],s=a[3];return t[0]=r*s+o*i+u*h-e*c,t[1]=u*s+o*c+e*i-r*h,t[2]=e*s+o*h+r*c-u*i,t[3]=o*s-r*i-u*c-e*h,i=a[4],c=a[5],h=a[6],s=a[7],t[4]=r*s+o*i+u*h-e*c,t[5]=u*s+o*c+e*i-r*h,t[6]=e*s+o*h+r*c-u*i,t[7]=o*s-r*i-u*c-e*h,t},rotateAroundAxis:function(t,a,r,u){if(Math.abs(u)<n)return sn(t,a);var e=Math.hypot(r[0],r[1],r[2]);u*=.5;var o=Math.sin(u),i=o*r[0]/e,c=o*r[1]/e,h=o*r[2]/e,s=Math.cos(u),M=a[0],f=a[1],l=a[2],v=a[3];t[0]=M*s+v*i+f*h-l*c,t[1]=f*s+v*c+l*i-M*h,t[2]=l*s+v*h+M*c-f*i,t[3]=v*s-M*i-f*c-l*h;var b=a[4],m=a[5],d=a[6],x=a[7];return t[4]=b*s+x*i+m*h-d*c,t[5]=m*s+x*c+d*i-b*h,t[6]=d*s+x*h+b*c-m*i,t[7]=x*s-b*i-m*c-d*h,t},add:function(t,n,a){return t[0]=n[0]+a[0],t[1]=n[1]+a[1],t[2]=n[2]+a[2],t[3]=n[3]+a[3],t[4]=n[4]+a[4],t[5]=n[5]+a[5],t[6]=n[6]+a[6],t[7]=n[7]+a[7],t},multiply:ln,mul:vn,scale:function(t,n,a){return t[0]=n[0]*a,t[1]=n[1]*a,t[2]=n[2]*a,t[3]=n[3]*a,t[4]=n[4]*a,t[5]=n[5]*a,t[6]=n[6]*a,t[7]=n[7]*a,t},dot:bn,lerp:function(t,n,a,r){var u=1-r;return bn(n,a)<0&&(r=-r),t[0]=n[0]*u+a[0]*r,t[1]=n[1]*u+a[1]*r,t[2]=n[2]*u+a[2]*r,t[3]=n[3]*u+a[3]*r,t[4]=n[4]*u+a[4]*r,t[5]=n[5]*u+a[5]*r,t[6]=n[6]*u+a[6]*r,t[7]=n[7]*u+a[7]*r,t},invert:function(t,n){var a=xn(n);return t[0]=-n[0]/a,t[1]=-n[1]/a,t[2]=-n[2]/a,t[3]=n[3]/a,t[4]=-n[4]/a,t[5]=-n[5]/a,t[6]=-n[6]/a,t[7]=n[7]/a,t},conjugate:function(t,n){return t[0]=-n[0],t[1]=-n[1],t[2]=-n[2],t[3]=n[3],t[4]=-n[4],t[5]=-n[5],t[6]=-n[6],t[7]=n[7],t},length:mn,len:dn,squaredLength:xn,sqrLen:pn,normalize:function(t,n){var a=xn(n);if(a>0){a=Math.sqrt(a);var r=n[0]/a,u=n[1]/a,e=n[2]/a,o=n[3]/a,i=n[4],c=n[5],h=n[6],s=n[7],M=r*i+u*c+e*h+o*s;t[0]=r,t[1]=u,t[2]=e,t[3]=o,t[4]=(i-r*M)/a,t[5]=(c-u*M)/a,t[6]=(h-e*M)/a,t[7]=(s-o*M)/a}return t},str:function(t){return"quat2("+t[0]+", "+t[1]+", "+t[2]+", "+t[3]+", "+t[4]+", "+t[5]+", "+t[6]+", "+t[7]+")"},exactEquals:function(t,n){return t[0]===n[0]&&t[1]===n[1]&&t[2]===n[2]&&t[3]===n[3]&&t[4]===n[4]&&t[5]===n[5]&&t[6]===n[6]&&t[7]===n[7]},equals:function(t,a){var r=t[0],u=t[1],e=t[2],o=t[3],i=t[4],c=t[5],h=t[6],s=t[7],M=a[0],f=a[1],l=a[2],v=a[3],b=a[4],m=a[5],d=a[6],x=a[7];return Math.abs(r-M)<=n*Math.max(1,Math.abs(r),Math.abs(M))&&Math.abs(u-f)<=n*Math.max(1,Math.abs(u),Math.abs(f))&&Math.abs(e-l)<=n*Math.max(1,Math.abs(e),Math.abs(l))&&Math.abs(o-v)<=n*Math.max(1,Math.abs(o),Math.abs(v))&&Math.abs(i-b)<=n*Math.max(1,Math.abs(i),Math.abs(b))&&Math.abs(c-m)<=n*Math.max(1,Math.abs(c),Math.abs(m))&&Math.abs(h-d)<=n*Math.max(1,Math.abs(h),Math.abs(d))&&Math.abs(s-x)<=n*Math.max(1,Math.abs(s),Math.abs(x))}});function qn(){var t=new a(2);return a!=Float32Array&&(t[0]=0,t[1]=0),t}function gn(t,n,a){return t[0]=n[0]-a[0],t[1]=n[1]-a[1],t}function An(t,n,a){return t[0]=n[0]*a[0],t[1]=n[1]*a[1],t}function wn(t,n,a){return t[0]=n[0]/a[0],t[1]=n[1]/a[1],t}function Rn(t,n){var a=n[0]-t[0],r=n[1]-t[1];return Math.hypot(a,r)}function zn(t,n){var a=n[0]-t[0],r=n[1]-t[1];return a*a+r*r}function Pn(t){var n=t[0],a=t[1];return Math.hypot(n,a)}function jn(t){var n=t[0],a=t[1];return n*n+a*a}var In=Pn,Sn=gn,En=An,On=wn,Tn=Rn,Dn=zn,Fn=jn,Ln=function(){var t=qn();return function(n,a,r,u,e,o){var i,c;for(a||(a=2),r||(r=0),c=u?Math.min(u*a+r,n.length):n.length,i=r;i<c;i+=a)t[0]=n[i],t[1]=n[i+1],e(t,t,o),n[i]=t[0],n[i+1]=t[1];return n}}(),Vn=Object.freeze({create:qn,clone:function(t){var n=new a(2);return n[0]=t[0],n[1]=t[1],n},fromValues:function(t,n){var r=new a(2);return r[0]=t,r[1]=n,r},copy:function(t,n){return t[0]=n[0],t[1]=n[1],t},set:function(t,n,a){return t[0]=n,t[1]=a,t},add:function(t,n,a){return t[0]=n[0]+a[0],t[1]=n[1]+a[1],t},subtract:gn,multiply:An,divide:wn,ceil:function(t,n){return t[0]=Math.ceil(n[0]),t[1]=Math.ceil(n[1]),t},floor:function(t,n){return t[0]=Math.floor(n[0]),t[1]=Math.floor(n[1]),t},min:function(t,n,a){return t[0]=Math.min(n[0],a[0]),t[1]=Math.min(n[1],a[1]),t},max:function(t,n,a){return t[0]=Math.max(n[0],a[0]),t[1]=Math.max(n[1],a[1]),t},round:function(t,n){return t[0]=Math.round(n[0]),t[1]=Math.round(n[1]),t},scale:function(t,n,a){return t[0]=n[0]*a,t[1]=n[1]*a,t},scaleAndAdd:function(t,n,a,r){return t[0]=n[0]+a[0]*r,t[1]=n[1]+a[1]*r,t},distance:Rn,squaredDistance:zn,length:Pn,squaredLength:jn,negate:function(t,n){return t[0]=-n[0],t[1]=-n[1],t},inverse:function(t,n){return t[0]=1/n[0],t[1]=1/n[1],t},normalize:function(t,n){var a=n[0],r=n[1],u=a*a+r*r;return u>0&&(u=1/Math.sqrt(u)),t[0]=n[0]*u,t[1]=n[1]*u,t},dot:function(t,n){return t[0]*n[0]+t[1]*n[1]},cross:function(t,n,a){var r=n[0]*a[1]-n[1]*a[0];return t[0]=t[1]=0,t[2]=r,t},lerp:function(t,n,a,r){var u=n[0],e=n[1];return t[0]=u+r*(a[0]-u),t[1]=e+r*(a[1]-e),t},random:function(t,n){n=n||1;var a=2*r()*Math.PI;return t[0]=Math.cos(a)*n,t[1]=Math.sin(a)*n,t},transformMat2:function(t,n,a){var r=n[0],u=n[1];return t[0]=a[0]*r+a[2]*u,t[1]=a[1]*r+a[3]*u,t},transformMat2d:function(t,n,a){var r=n[0],u=n[1];return t[0]=a[0]*r+a[2]*u+a[4],t[1]=a[1]*r+a[3]*u+a[5],t},transformMat3:function(t,n,a){var r=n[0],u=n[1];return t[0]=a[0]*r+a[3]*u+a[6],t[1]=a[1]*r+a[4]*u+a[7],t},transformMat4:function(t,n,a){var r=n[0],u=n[1];return t[0]=a[0]*r+a[4]*u+a[12],t[1]=a[1]*r+a[5]*u+a[13],t},rotate:function(t,n,a,r){var u=n[0]-a[0],e=n[1]-a[1],o=Math.sin(r),i=Math.cos(r);return t[0]=u*i-e*o+a[0],t[1]=u*o+e*i+a[1],t},angle:function(t,n){var a=t[0],r=t[1],u=n[0],e=n[1],o=a*a+r*r;o>0&&(o=1/Math.sqrt(o));var i=u*u+e*e;i>0&&(i=1/Math.sqrt(i));var c=(a*u+r*e)*o*i;return c>1?0:c<-1?Math.PI:Math.acos(c)},zero:function(t){return t[0]=0,t[1]=0,t},str:function(t){return"vec2("+t[0]+", "+t[1]+")"},exactEquals:function(t,n){return t[0]===n[0]&&t[1]===n[1]},equals:function(t,a){var r=t[0],u=t[1],e=a[0],o=a[1];return Math.abs(r-e)<=n*Math.max(1,Math.abs(r),Math.abs(e))&&Math.abs(u-o)<=n*Math.max(1,Math.abs(u),Math.abs(o))},len:In,sub:Sn,mul:En,div:On,dist:Tn,sqrDist:Dn,sqrLen:Fn,forEach:Ln});t.glMatrix=e,t.mat2=s,t.mat2d=b,t.mat3=q,t.mat4=E,t.quat=cn,t.quat2=yn,t.vec2=Vn,t.vec3=$,t.vec4=Pt,Object.defineProperty(t,"__esModule",{value:!0})});
//LZString for compression
var LZString=function(){function o(o,r){if(!t[o]){t[o]={};for(var n=0;n<o.length;n++)t[o][o.charAt(n)]=n}return t[o][r]}var r=String.fromCharCode,n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$",t={},i={compressToBase64:function(o){if(null==o)return"";var r=i._compress(o,6,function(o){return n.charAt(o)});switch(r.length%4){default:case 0:return r;case 1:return r+"===";case 2:return r+"==";case 3:return r+"="}},decompressFromBase64:function(r){return null==r?"":""==r?null:i._decompress(r.length,32,function(e){return o(n,r.charAt(e))})},compressToUTF16:function(o){return null==o?"":i._compress(o,15,function(o){return r(o+32)})+" "},decompressFromUTF16:function(o){return null==o?"":""==o?null:i._decompress(o.length,16384,function(r){return o.charCodeAt(r)-32})},compressToUint8Array:function(o){for(var r=i.compress(o),n=new Uint8Array(2*r.length),e=0,t=r.length;t>e;e++){var s=r.charCodeAt(e);n[2*e]=s>>>8,n[2*e+1]=s%256}return n},decompressFromUint8Array:function(o){if(null===o||void 0===o)return i.decompress(o);for(var n=new Array(o.length/2),e=0,t=n.length;t>e;e++)n[e]=256*o[2*e]+o[2*e+1];var s=[];return n.forEach(function(o){s.push(r(o))}),i.decompress(s.join(""))},compressToEncodedURIComponent:function(o){return null==o?"":i._compress(o,6,function(o){return e.charAt(o)})},decompressFromEncodedURIComponent:function(r){return null==r?"":""==r?null:(r=r.replace(/ /g,"+"),i._decompress(r.length,32,function(n){return o(e,r.charAt(n))}))},compress:function(o){return i._compress(o,16,function(o){return r(o)})},_compress:function(o,r,n){if(null==o)return"";var e,t,i,s={},p={},u="",c="",a="",l=2,f=3,h=2,d=[],m=0,v=0;for(i=0;i<o.length;i+=1)if(u=o.charAt(i),Object.prototype.hasOwnProperty.call(s,u)||(s[u]=f++,p[u]=!0),c=a+u,Object.prototype.hasOwnProperty.call(s,c))a=c;else{if(Object.prototype.hasOwnProperty.call(p,a)){if(a.charCodeAt(0)<256){for(e=0;h>e;e++)m<<=1,v==r-1?(v=0,d.push(n(m)),m=0):v++;for(t=a.charCodeAt(0),e=0;8>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}else{for(t=1,e=0;h>e;e++)m=m<<1|t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t=0;for(t=a.charCodeAt(0),e=0;16>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}l--,0==l&&(l=Math.pow(2,h),h++),delete p[a]}else for(t=s[a],e=0;h>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;l--,0==l&&(l=Math.pow(2,h),h++),s[c]=f++,a=String(u)}if(""!==a){if(Object.prototype.hasOwnProperty.call(p,a)){if(a.charCodeAt(0)<256){for(e=0;h>e;e++)m<<=1,v==r-1?(v=0,d.push(n(m)),m=0):v++;for(t=a.charCodeAt(0),e=0;8>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}else{for(t=1,e=0;h>e;e++)m=m<<1|t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t=0;for(t=a.charCodeAt(0),e=0;16>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}l--,0==l&&(l=Math.pow(2,h),h++),delete p[a]}else for(t=s[a],e=0;h>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;l--,0==l&&(l=Math.pow(2,h),h++)}for(t=2,e=0;h>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;for(;;){if(m<<=1,v==r-1){d.push(n(m));break}v++}return d.join("")},decompress:function(o){return null==o?"":""==o?null:i._decompress(o.length,32768,function(r){return o.charCodeAt(r)})},_decompress:function(o,n,e){var t,i,s,p,u,c,a,l,f=[],h=4,d=4,m=3,v="",w=[],A={val:e(0),position:n,index:1};for(i=0;3>i;i+=1)f[i]=i;for(p=0,c=Math.pow(2,2),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;switch(t=p){case 0:for(p=0,c=Math.pow(2,8),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;l=r(p);break;case 1:for(p=0,c=Math.pow(2,16),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;l=r(p);break;case 2:return""}for(f[3]=l,s=l,w.push(l);;){if(A.index>o)return"";for(p=0,c=Math.pow(2,m),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;switch(l=p){case 0:for(p=0,c=Math.pow(2,8),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;f[d++]=r(p),l=d-1,h--;break;case 1:for(p=0,c=Math.pow(2,16),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;f[d++]=r(p),l=d-1,h--;break;case 2:return w.join("")}if(0==h&&(h=Math.pow(2,m),m++),f[l])v=f[l];else{if(l!==d)return null;v=s+s.charAt(0)}w.push(v),f[d++]=s+v.charAt(0),h--,s=v,0==h&&(h=Math.pow(2,m),m++)}}};return i}();"function"==typeof define&&define.amd?define(function(){return LZString}):"undefined"!=typeof module&&null!=module&&(module.exports=LZString);
//LZMA for compression
var e=function(){"use strict";function r(e,r){postMessage({action:xt,cbn:r,result:e})}function t(e){var r=[];return r[e-1]=void 0,r}function o(e,r){return i(e[0]+r[0],e[1]+r[1])}function n(e,r){return u(~~Math.max(Math.min(e[1]/Ot,2147483647),-2147483648)&~~Math.max(Math.min(r[1]/Ot,2147483647),-2147483648),c(e)&c(r))}function s(e,r){var t,o;return e[0]==r[0]&&e[1]==r[1]?0:(t=0>e[1],o=0>r[1],t&&!o?-1:!t&&o?1:h(e,r)[1]<0?-1:1)}function i(e,r){var t,o;for(r%=0x10000000000000000,e%=0x10000000000000000,t=r%Ot,o=Math.floor(e/Ot)*Ot,r=r-t+o,e=e-o+t;0>e;)e+=Ot,r-=Ot;for(;e>4294967295;)e-=Ot,r+=Ot;for(r%=0x10000000000000000;r>0x7fffffff00000000;)r-=0x10000000000000000;for(;-0x8000000000000000>r;)r+=0x10000000000000000;return[e,r]}function _(e,r){return e[0]==r[0]&&e[1]==r[1]}function a(e){return e>=0?[e,0]:[e+Ot,-Ot]}function c(e){return e[0]>=2147483648?~~Math.max(Math.min(e[0]-Ot,2147483647),-2147483648):~~Math.max(Math.min(e[0],2147483647),-2147483648)}function u(e,r){var t,o;return t=e*Ot,o=r,0>r&&(o+=Ot),[o,t]}function f(e){return 30>=e?1<<e:f(30)*f(e-30)}function m(e,r){var t,o,n,s;if(r&=63,_(e,Ht))return r?Gt:e;if(0>e[1])throw Error("Neg");return s=f(r),o=e[1]*s%0x10000000000000000,n=e[0]*s,t=n-n%Ot,o+=t,n-=t,o>=0x8000000000000000&&(o-=0x10000000000000000),[n,o]}function d(e,r){var t;return r&=63,t=f(r),i(Math.floor(e[0]/t),e[1]/t)}function p(e,r){var t;return r&=63,t=d(e,r),0>e[1]&&(t=o(t,m([2,0],63-r))),t}function h(e,r){return i(e[0]-r[0],e[1]-r[1])}function P(e,r){return e.Mc=r,e.Lc=0,e.Yb=r.length,e}function l(e){return e.Lc>=e.Yb?-1:255&e.Mc[e.Lc++]}function v(e,r,t,o){return e.Lc>=e.Yb?-1:(o=Math.min(o,e.Yb-e.Lc),M(e.Mc,e.Lc,r,t,o),e.Lc+=o,o)}function B(e){return e.Mc=t(32),e.Yb=0,e}function S(e){var r=e.Mc;return r.length=e.Yb,r}function g(e,r){e.Mc[e.Yb++]=r<<24>>24}function k(e,r,t,o){M(r,t,e.Mc,e.Yb,o),e.Yb+=o}function R(e,r,t,o,n){var s;for(s=r;t>s;++s)o[n++]=e.charCodeAt(s)}function M(e,r,t,o,n){for(var s=0;n>s;++s)t[o+s]=e[r+s]}function D(e,r){Ar(r,1<<e.s),r.n=e.f,Hr(r,e.m),r.eb=0,r.fb=3,r.Y=2,r.y=3}function b(r,t,o,n,i){var _,a;if(s(n,At)<0)throw Error("invalid length "+n);for(r.Tb=n,_=Dr({}),D(i,_),_.Gc=void 0===e.disableEndMark,Gr(_,o),a=0;64>a;a+=8)g(o,255&c(d(n,a)));r.yb=(_.W=0,_.oc=t,_.pc=0,Mr(_),_.d.Ab=o,Fr(_),wr(_),br(_),_.$.rb=_.n+1-2,Qr(_.$,1<<_.Y),_.i.rb=_.n+1-2,Qr(_.i,1<<_.Y),void(_.g=Gt),X({},_))}function w(e,r,t){return e.Nb=B({}),b(e,P({},r),e.Nb,a(r.length),t),e}function E(e,r,t){var o,n,s,i,_="",c=[];for(n=0;5>n;++n){if(s=l(r),-1==s)throw Error("truncated input");c[n]=s<<24>>24}if(o=ir({}),!ar(o,c))throw Error("corrupted input");for(n=0;64>n;n+=8){if(s=l(r),-1==s)throw Error("truncated input");s=s.toString(16),1==s.length&&(s="0"+s),_=s+""+_}/^0+$|^f+$/i.test(_)?e.Tb=At:(i=parseInt(_,16),e.Tb=i>4294967295?At:a(i)),e.yb=nr(o,r,t,e.Tb)}function L(e,r){return e.Nb=B({}),E(e,P({},r),e.Nb),e}function y(e,r,o,n){var s;e.Bc=r,e._b=o,s=r+o+n,(null==e.c||e.Kb!=s)&&(e.c=null,e.Kb=s,e.c=t(e.Kb)),e.H=e.Kb-o}function C(e,r){return e.c[e.f+e.o+r]}function z(e,r,t,o){var n,s;for(e.T&&e.o+r+o>e.h&&(o=e.h-(e.o+r)),++t,s=e.f+e.o+r,n=0;o>n&&e.c[s+n]==e.c[s+n-t];++n);return n}function F(e){return e.h-e.o}function I(e){var r,t,o;for(o=e.f+e.o-e.Bc,o>0&&--o,t=e.f+e.h-o,r=0;t>r;++r)e.c[r]=e.c[o+r];e.f-=o}function x(e){var r;++e.o,e.o>e.zb&&(r=e.f+e.o,r>e.H&&I(e),N(e))}function N(e){var r,t,o;if(!e.T)for(;;){if(o=-e.f+e.Kb-e.h,!o)return;if(r=v(e.cc,e.c,e.f+e.h,o),-1==r)return e.zb=e.h,t=e.f+e.zb,t>e.H&&(e.zb=e.H-e.f),void(e.T=1);e.h+=r,e.h>=e.o+e._b&&(e.zb=e.h-e._b)}}function O(e,r){e.f+=r,e.zb-=r,e.o-=r,e.h-=r}function A(e,r,o,n,s){var i,_,a;1073741567>r&&(e.Fc=16+(n>>1),a=~~((r+o+n+s)/2)+256,y(e,r+o,n+s,a),e.ob=n,i=r+1,e.p!=i&&(e.L=t(2*(e.p=i))),_=65536,e.qb&&(_=r-1,_|=_>>1,_|=_>>2,_|=_>>4,_|=_>>8,_>>=1,_|=65535,_>16777216&&(_>>=1),e.Ec=_,++_,_+=e.R),_!=e.rc&&(e.ub=t(e.rc=_)))}function H(e,r){var t,o,n,s,i,_,a,c,u,f,m,d,p,h,P,l,v,B,S,g,k;if(e.h>=e.o+e.ob)h=e.ob;else if(h=e.h-e.o,e.xb>h)return W(e),0;for(v=0,P=e.o>e.p?e.o-e.p:0,o=e.f+e.o,l=1,c=0,u=0,e.qb?(k=Tt[255&e.c[o]]^255&e.c[o+1],c=1023&k,k^=(255&e.c[o+2])<<8,u=65535&k,f=(k^Tt[255&e.c[o+3]]<<5)&e.Ec):f=255&e.c[o]^(255&e.c[o+1])<<8,n=e.ub[e.R+f]||0,e.qb&&(s=e.ub[c]||0,i=e.ub[1024+u]||0,e.ub[c]=e.o,e.ub[1024+u]=e.o,s>P&&e.c[e.f+s]==e.c[o]&&(r[v++]=l=2,r[v++]=e.o-s-1),i>P&&e.c[e.f+i]==e.c[o]&&(i==s&&(v-=2),r[v++]=l=3,r[v++]=e.o-i-1,s=i),0!=v&&s==n&&(v-=2,l=1)),e.ub[e.R+f]=e.o,S=(e.k<<1)+1,g=e.k<<1,d=p=e.w,0!=e.w&&n>P&&e.c[e.f+n+e.w]!=e.c[o+e.w]&&(r[v++]=l=e.w,r[v++]=e.o-n-1),t=e.Fc;;){if(P>=n||0==t--){e.L[S]=e.L[g]=0;break}if(a=e.o-n,_=(e.k>=a?e.k-a:e.k-a+e.p)<<1,B=e.f+n,m=p>d?d:p,e.c[B+m]==e.c[o+m]){for(;++m!=h&&e.c[B+m]==e.c[o+m];);if(m>l&&(r[v++]=l=m,r[v++]=a-1,m==h)){e.L[g]=e.L[_],e.L[S]=e.L[_+1];break}}(255&e.c[o+m])>(255&e.c[B+m])?(e.L[g]=n,g=_+1,n=e.L[g],p=m):(e.L[S]=n,S=_,n=e.L[S],d=m)}return W(e),v}function G(e){e.f=0,e.o=0,e.h=0,e.T=0,N(e),e.k=0,O(e,-1)}function W(e){var r;++e.k>=e.p&&(e.k=0),x(e),1073741823==e.o&&(r=e.o-e.p,T(e.L,2*e.p,r),T(e.ub,e.rc,r),O(e,r))}function T(e,r,t){var o,n;for(o=0;r>o;++o)n=e[o]||0,t>=n?n=0:n-=t,e[o]=n}function Z(e,r){e.qb=r>2,e.qb?(e.w=0,e.xb=4,e.R=66560):(e.w=2,e.xb=3,e.R=0)}function Y(e,r){var t,o,n,s,i,_,a,c,u,f,m,d,p,h,P,l,v;do{if(e.h>=e.o+e.ob)d=e.ob;else if(d=e.h-e.o,e.xb>d){W(e);continue}for(p=e.o>e.p?e.o-e.p:0,o=e.f+e.o,e.qb?(v=Tt[255&e.c[o]]^255&e.c[o+1],_=1023&v,e.ub[_]=e.o,v^=(255&e.c[o+2])<<8,a=65535&v,e.ub[1024+a]=e.o,c=(v^Tt[255&e.c[o+3]]<<5)&e.Ec):c=255&e.c[o]^(255&e.c[o+1])<<8,n=e.ub[e.R+c],e.ub[e.R+c]=e.o,P=(e.k<<1)+1,l=e.k<<1,f=m=e.w,t=e.Fc;;){if(p>=n||0==t--){e.L[P]=e.L[l]=0;break}if(i=e.o-n,s=(e.k>=i?e.k-i:e.k-i+e.p)<<1,h=e.f+n,u=m>f?f:m,e.c[h+u]==e.c[o+u]){for(;++u!=d&&e.c[h+u]==e.c[o+u];);if(u==d){e.L[l]=e.L[s],e.L[P]=e.L[s+1];break}}(255&e.c[o+u])>(255&e.c[h+u])?(e.L[l]=n,l=s+1,n=e.L[l],m=u):(e.L[P]=n,P=s,n=e.L[P],f=u)}W(e)}while(0!=--r)}function V(e,r,t){var o=e.o-r-1;for(0>o&&(o+=e.M);0!=t;--t)o>=e.M&&(o=0),e.Lb[e.o++]=e.Lb[o++],e.o>=e.M&&$(e)}function j(e,r){(null==e.Lb||e.M!=r)&&(e.Lb=t(r)),e.M=r,e.o=0,e.h=0}function $(e){var r=e.o-e.h;r&&(k(e.cc,e.Lb,e.h,r),e.o>=e.M&&(e.o=0),e.h=e.o)}function K(e,r){var t=e.o-r-1;return 0>t&&(t+=e.M),e.Lb[t]}function q(e,r){e.Lb[e.o++]=r,e.o>=e.M&&$(e)}function J(e){$(e),e.cc=null}function Q(e){return e-=2,4>e?e:3}function U(e){return 4>e?0:10>e?e-3:e-6}function X(e,r){return e.cb=r,e.Z=null,e.zc=1,e}function er(e,r){return e.Z=r,e.cb=null,e.zc=1,e}function rr(e){if(!e.zc)throw Error("bad state");return e.cb?or(e):tr(e),e.zc}function tr(e){var r=sr(e.Z);if(-1==r)throw Error("corrupted input");e.Pb=At,e.Pc=e.Z.g,(r||s(e.Z.Nc,Gt)>=0&&s(e.Z.g,e.Z.Nc)>=0)&&($(e.Z.B),J(e.Z.B),e.Z.e.Ab=null,e.zc=0)}function or(e){Rr(e.cb,e.cb.Xb,e.cb.uc,e.cb.Kc),e.Pb=e.cb.Xb[0],e.cb.Kc[0]&&(Or(e.cb),e.zc=0)}function nr(e,r,t,o){return e.e.Ab=r,J(e.B),e.B.cc=t,_r(e),e.U=0,e.ib=0,e.Jc=0,e.Ic=0,e.Qc=0,e.Nc=o,e.g=Gt,e.jc=0,er({},e)}function sr(e){var r,t,n,i,_,u;if(u=c(e.g)&e.Dc,vt(e.e,e.Gb,(e.U<<4)+u)){if(vt(e.e,e.Zb,e.U))n=0,vt(e.e,e.Cb,e.U)?(vt(e.e,e.Db,e.U)?(vt(e.e,e.Eb,e.U)?(t=e.Qc,e.Qc=e.Ic):t=e.Ic,e.Ic=e.Jc):t=e.Jc,e.Jc=e.ib,e.ib=t):vt(e.e,e.pb,(e.U<<4)+u)||(e.U=7>e.U?9:11,n=1),n||(n=mr(e.sb,e.e,u)+2,e.U=7>e.U?8:11);else if(e.Qc=e.Ic,e.Ic=e.Jc,e.Jc=e.ib,n=2+mr(e.Rb,e.e,u),e.U=7>e.U?7:10,_=at(e.kb[Q(n)],e.e),_>=4){if(i=(_>>1)-1,e.ib=(2|1&_)<<i,14>_)e.ib+=ut(e.kc,e.ib-_-1,e.e,i);else if(e.ib+=Bt(e.e,i-4)<<4,e.ib+=ct(e.Fb,e.e),0>e.ib)return-1==e.ib?1:-1}else e.ib=_;if(s(a(e.ib),e.g)>=0||e.ib>=e.nb)return-1;V(e.B,e.ib,n),e.g=o(e.g,a(n)),e.jc=K(e.B,0)}else r=Pr(e.gb,c(e.g),e.jc),e.jc=7>e.U?vr(r,e.e):Br(r,e.e,K(e.B,e.ib)),q(e.B,e.jc),e.U=U(e.U),e.g=o(e.g,Wt);return 0}function ir(e){e.B={},e.e={},e.Gb=t(192),e.Zb=t(12),e.Cb=t(12),e.Db=t(12),e.Eb=t(12),e.pb=t(192),e.kb=t(4),e.kc=t(114),e.Fb=_t({},4),e.Rb=dr({}),e.sb=dr({}),e.gb={};for(var r=0;4>r;++r)e.kb[r]=_t({},6);return e}function _r(e){e.B.h=0,e.B.o=0,gt(e.Gb),gt(e.pb),gt(e.Zb),gt(e.Cb),gt(e.Db),gt(e.Eb),gt(e.kc),lr(e.gb);for(var r=0;4>r;++r)gt(e.kb[r].G);pr(e.Rb),pr(e.sb),gt(e.Fb.G),St(e.e)}function ar(e,r){var t,o,n,s,i,_,a;if(5>r.length)return 0;for(a=255&r[0],n=a%9,_=~~(a/9),s=_%5,i=~~(_/5),t=0,o=0;4>o;++o)t+=(255&r[1+o])<<8*o;return t>99999999||!ur(e,n,s,i)?0:cr(e,t)}function cr(e,r){return 0>r?0:(e.Ob!=r&&(e.Ob=r,e.nb=Math.max(e.Ob,1),j(e.B,Math.max(e.nb,4096))),1)}function ur(e,r,t,o){if(r>8||t>4||o>4)return 0;hr(e.gb,t,r);var n=1<<o;return fr(e.Rb,n),fr(e.sb,n),e.Dc=n-1,1}function fr(e,r){for(;r>e.O;++e.O)e.ec[e.O]=_t({},3),e.hc[e.O]=_t({},3)}function mr(e,r,t){if(!vt(r,e.wc,0))return at(e.ec[t],r);var o=8;return o+=vt(r,e.wc,1)?8+at(e.tc,r):at(e.hc[t],r)}function dr(e){return e.wc=t(2),e.ec=t(16),e.hc=t(16),e.tc=_t({},8),e.O=0,e}function pr(e){gt(e.wc);for(var r=0;e.O>r;++r)gt(e.ec[r].G),gt(e.hc[r].G);gt(e.tc.G)}function hr(e,r,o){var n,s;if(null==e.V||e.u!=o||e.I!=r)for(e.I=r,e.qc=(1<<r)-1,e.u=o,s=1<<e.u+e.I,e.V=t(s),n=0;s>n;++n)e.V[n]=Sr({})}function Pr(e,r,t){return e.V[((r&e.qc)<<e.u)+((255&t)>>>8-e.u)]}function lr(e){var r,t;for(t=1<<e.u+e.I,r=0;t>r;++r)gt(e.V[r].Ib)}function vr(e,r){var t=1;do t=t<<1|vt(r,e.Ib,t);while(256>t);return t<<24>>24}function Br(e,r,t){var o,n,s=1;do if(n=t>>7&1,t<<=1,o=vt(r,e.Ib,(1+n<<8)+s),s=s<<1|o,n!=o){for(;256>s;)s=s<<1|vt(r,e.Ib,s);break}while(256>s);return s<<24>>24}function Sr(e){return e.Ib=t(768),e}function gr(e,r){var t,o,n,s;e.jb=r,n=e.a[r].r,o=e.a[r].j;do e.a[r].t&&(st(e.a[n]),e.a[n].r=n-1,e.a[r].Ac&&(e.a[n-1].t=0,e.a[n-1].r=e.a[r].r2,e.a[n-1].j=e.a[r].j2)),s=n,t=o,o=e.a[s].j,n=e.a[s].r,e.a[s].j=t,e.a[s].r=r,r=s;while(r>0);return e.mb=e.a[0].j,e.q=e.a[0].r}function kr(e){e.l=0,e.J=0;for(var r=0;4>r;++r)e.v[r]=0}function Rr(e,r,t,n){var i,u,f,m,d,p,P,l,v,B,S,g,k,R,M;if(r[0]=Gt,t[0]=Gt,n[0]=1,e.oc&&(e.b.cc=e.oc,G(e.b),e.W=1,e.oc=null),!e.pc){if(e.pc=1,R=e.g,_(e.g,Gt)){if(!F(e.b))return void Er(e,c(e.g));xr(e),k=c(e.g)&e.y,kt(e.d,e.C,(e.l<<4)+k,0),e.l=U(e.l),f=C(e.b,-e.s),rt(Xr(e.A,c(e.g),e.J),e.d,f),e.J=f,--e.s,e.g=o(e.g,Wt)}if(!F(e.b))return void Er(e,c(e.g));for(;;){if(P=Lr(e,c(e.g)),B=e.mb,k=c(e.g)&e.y,u=(e.l<<4)+k,1==P&&-1==B)kt(e.d,e.C,u,0),f=C(e.b,-e.s),M=Xr(e.A,c(e.g),e.J),7>e.l?rt(M,e.d,f):(v=C(e.b,-e.v[0]-1-e.s),tt(M,e.d,v,f)),e.J=f,e.l=U(e.l);else{if(kt(e.d,e.C,u,1),4>B){if(kt(e.d,e.bb,e.l,1),B?(kt(e.d,e.hb,e.l,1),1==B?kt(e.d,e.Ub,e.l,0):(kt(e.d,e.Ub,e.l,1),kt(e.d,e.vc,e.l,B-2))):(kt(e.d,e.hb,e.l,0),1==P?kt(e.d,e._,u,0):kt(e.d,e._,u,1)),1==P?e.l=7>e.l?9:11:(Kr(e.i,e.d,P-2,k),e.l=7>e.l?8:11),m=e.v[B],0!=B){for(p=B;p>=1;--p)e.v[p]=e.v[p-1];e.v[0]=m}}else{for(kt(e.d,e.bb,e.l,0),e.l=7>e.l?7:10,Kr(e.$,e.d,P-2,k),B-=4,g=Tr(B),l=Q(P),mt(e.K[l],e.d,g),g>=4&&(d=(g>>1)-1,i=(2|1&g)<<d,S=B-i,14>g?Pt(e.Sb,i-g-1,e.d,d,S):(Rt(e.d,S>>4,d-4),pt(e.S,e.d,15&S),++e.Qb)),m=B,p=3;p>=1;--p)e.v[p]=e.v[p-1];e.v[0]=m,++e.Mb}e.J=C(e.b,P-1-e.s)}if(e.s-=P,e.g=o(e.g,a(P)),!e.s){if(e.Mb>=128&&wr(e),e.Qb>=16&&br(e),r[0]=e.g,t[0]=Mt(e.d),!F(e.b))return void Er(e,c(e.g));if(s(h(e.g,R),[4096,0])>=0)return e.pc=0,void(n[0]=0)}}}}function Mr(e){var r,t;e.b||(r={},t=4,e.X||(t=2),Z(r,t),e.b=r),Ur(e.A,e.eb,e.fb),(e.ab!=e.wb||e.Hb!=e.n)&&(A(e.b,e.ab,4096,e.n,274),e.wb=e.ab,e.Hb=e.n)}function Dr(e){var r;for(e.v=t(4),e.a=[],e.d={},e.C=t(192),e.bb=t(12),e.hb=t(12),e.Ub=t(12),e.vc=t(12),e._=t(192),e.K=[],e.Sb=t(114),e.S=ft({},4),e.$=qr({}),e.i=qr({}),e.A={},e.m=[],e.P=[],e.lb=[],e.nc=t(16),e.x=t(4),e.Q=t(4),e.Xb=[Gt],e.uc=[Gt],e.Kc=[0],e.fc=t(5),e.yc=t(128),e.vb=0,e.X=1,e.D=0,e.Hb=-1,e.mb=0,r=0;4096>r;++r)e.a[r]={};for(r=0;4>r;++r)e.K[r]=ft({},6);return e}function br(e){for(var r=0;16>r;++r)e.nc[r]=ht(e.S,r);e.Qb=0}function wr(e){var r,t,o,n,s,i,_,a;for(n=4;128>n;++n)i=Tr(n),o=(i>>1)-1,r=(2|1&i)<<o,e.yc[n]=lt(e.Sb,r-i-1,o,n-r);for(s=0;4>s;++s){for(t=e.K[s],_=s<<6,i=0;e.$b>i;++i)e.P[_+i]=dt(t,i);for(i=14;e.$b>i;++i)e.P[_+i]+=(i>>1)-1-4<<6;for(a=128*s,n=0;4>n;++n)e.lb[a+n]=e.P[_+n];for(;128>n;++n)e.lb[a+n]=e.P[_+Tr(n)]+e.yc[n]}e.Mb=0}function Er(e,r){Nr(e),Wr(e,r&e.y);for(var t=0;5>t;++t)bt(e.d)}function Lr(e,r){var t,o,n,s,i,_,a,c,u,f,m,d,p,h,P,l,v,B,S,g,k,R,M,D,b,w,E,L,y,I,x,N,O,A,H,G,W,T,Z,Y,V,j,$,K,q,J,Q,X,er,rr;if(e.jb!=e.q)return p=e.a[e.q].r-e.q,e.mb=e.a[e.q].j,e.q=e.a[e.q].r,p;if(e.q=e.jb=0,e.N?(d=e.vb,e.N=0):d=xr(e),E=e.D,b=F(e.b)+1,2>b)return e.mb=-1,1;for(b>273&&(b=273),Y=0,u=0;4>u;++u)e.x[u]=e.v[u],e.Q[u]=z(e.b,-1,e.x[u],273),e.Q[u]>e.Q[Y]&&(Y=u);if(e.Q[Y]>=e.n)return e.mb=Y,p=e.Q[Y],Ir(e,p-1),p;if(d>=e.n)return e.mb=e.m[E-1]+4,Ir(e,d-1),d;if(a=C(e.b,-1),v=C(e.b,-e.v[0]-1-1),2>d&&a!=v&&2>e.Q[Y])return e.mb=-1,1;if(e.a[0].Hc=e.l,A=r&e.y,e.a[1].z=Yt[e.C[(e.l<<4)+A]>>>2]+nt(Xr(e.A,r,e.J),e.l>=7,v,a),st(e.a[1]),B=Yt[2048-e.C[(e.l<<4)+A]>>>2],Z=B+Yt[2048-e.bb[e.l]>>>2],v==a&&(V=Z+zr(e,e.l,A),e.a[1].z>V&&(e.a[1].z=V,it(e.a[1]))),m=d>=e.Q[Y]?d:e.Q[Y],2>m)return e.mb=e.a[1].j,1;e.a[1].r=0,e.a[0].bc=e.x[0],e.a[0].ac=e.x[1],e.a[0].dc=e.x[2],e.a[0].lc=e.x[3],f=m;do e.a[f--].z=268435455;while(f>=2);for(u=0;4>u;++u)if(T=e.Q[u],!(2>T)){G=Z+Cr(e,u,e.l,A);do s=G+Jr(e.i,T-2,A),x=e.a[T],x.z>s&&(x.z=s,x.r=0,x.j=u,x.t=0);while(--T>=2)}if(D=B+Yt[e.bb[e.l]>>>2],f=e.Q[0]>=2?e.Q[0]+1:2,d>=f){for(L=0;f>e.m[L];)L+=2;for(;c=e.m[L+1],s=D+yr(e,c,f,A),x=e.a[f],x.z>s&&(x.z=s,x.r=0,x.j=c+4,x.t=0),f!=e.m[L]||(L+=2,L!=E);++f);}for(t=0;;){if(++t,t==m)return gr(e,t);if(S=xr(e),E=e.D,S>=e.n)return e.vb=S,e.N=1,gr(e,t);if(++r,O=e.a[t].r,e.a[t].t?(--O,e.a[t].Ac?($=e.a[e.a[t].r2].Hc,$=4>e.a[t].j2?7>$?8:11:7>$?7:10):$=e.a[O].Hc,$=U($)):$=e.a[O].Hc,O==t-1?$=e.a[t].j?U($):7>$?9:11:(e.a[t].t&&e.a[t].Ac?(O=e.a[t].r2,N=e.a[t].j2,$=7>$?8:11):(N=e.a[t].j,$=4>N?7>$?8:11:7>$?7:10),I=e.a[O],4>N?N?1==N?(e.x[0]=I.ac,e.x[1]=I.bc,e.x[2]=I.dc,e.x[3]=I.lc):2==N?(e.x[0]=I.dc,e.x[1]=I.bc,e.x[2]=I.ac,e.x[3]=I.lc):(e.x[0]=I.lc,e.x[1]=I.bc,e.x[2]=I.ac,e.x[3]=I.dc):(e.x[0]=I.bc,e.x[1]=I.ac,e.x[2]=I.dc,e.x[3]=I.lc):(e.x[0]=N-4,e.x[1]=I.bc,e.x[2]=I.ac,e.x[3]=I.dc)),e.a[t].Hc=$,e.a[t].bc=e.x[0],e.a[t].ac=e.x[1],e.a[t].dc=e.x[2],e.a[t].lc=e.x[3],_=e.a[t].z,a=C(e.b,-1),v=C(e.b,-e.x[0]-1-1),A=r&e.y,o=_+Yt[e.C[($<<4)+A]>>>2]+nt(Xr(e.A,r,C(e.b,-2)),$>=7,v,a),R=e.a[t+1],g=0,R.z>o&&(R.z=o,R.r=t,R.j=-1,R.t=0,g=1),B=_+Yt[2048-e.C[($<<4)+A]>>>2],Z=B+Yt[2048-e.bb[$]>>>2],v!=a||t>R.r&&!R.j||(V=Z+(Yt[e.hb[$]>>>2]+Yt[e._[($<<4)+A]>>>2]),R.z>=V&&(R.z=V,R.r=t,R.j=0,R.t=0,g=1)),w=F(e.b)+1,w=w>4095-t?4095-t:w,b=w,!(2>b)){if(b>e.n&&(b=e.n),!g&&v!=a&&(q=Math.min(w-1,e.n),P=z(e.b,0,e.x[0],q),P>=2)){for(K=U($),H=r+1&e.y,M=o+Yt[2048-e.C[(K<<4)+H]>>>2]+Yt[2048-e.bb[K]>>>2],y=t+1+P;y>m;)e.a[++m].z=268435455;s=M+(J=Jr(e.i,P-2,H),J+Cr(e,0,K,H)),x=e.a[y],x.z>s&&(x.z=s,x.r=t+1,x.j=0,x.t=1,x.Ac=0)}for(j=2,W=0;4>W;++W)if(h=z(e.b,-1,e.x[W],b),!(2>h)){l=h;do{for(;t+h>m;)e.a[++m].z=268435455;s=Z+(Q=Jr(e.i,h-2,A),Q+Cr(e,W,$,A)),x=e.a[t+h],x.z>s&&(x.z=s,x.r=t,x.j=W,x.t=0)}while(--h>=2);if(h=l,W||(j=h+1),w>h&&(q=Math.min(w-1-h,e.n),P=z(e.b,h,e.x[W],q),P>=2)){for(K=7>$?8:11,H=r+h&e.y,n=Z+(X=Jr(e.i,h-2,A),X+Cr(e,W,$,A))+Yt[e.C[(K<<4)+H]>>>2]+nt(Xr(e.A,r+h,C(e.b,h-1-1)),1,C(e.b,h-1-(e.x[W]+1)),C(e.b,h-1)),K=U(K),H=r+h+1&e.y,k=n+Yt[2048-e.C[(K<<4)+H]>>>2],M=k+Yt[2048-e.bb[K]>>>2],y=h+1+P;t+y>m;)e.a[++m].z=268435455;s=M+(er=Jr(e.i,P-2,H),er+Cr(e,0,K,H)),x=e.a[t+y],x.z>s&&(x.z=s,x.r=t+h+1,x.j=0,x.t=1,x.Ac=1,x.r2=t,x.j2=W)}}if(S>b){for(S=b,E=0;S>e.m[E];E+=2);e.m[E]=S,E+=2}if(S>=j){for(D=B+Yt[e.bb[$]>>>2];t+S>m;)e.a[++m].z=268435455;for(L=0;j>e.m[L];)L+=2;for(h=j;;++h)if(i=e.m[L+1],s=D+yr(e,i,h,A),x=e.a[t+h],x.z>s&&(x.z=s,x.r=t,x.j=i+4,x.t=0),h==e.m[L]){if(w>h&&(q=Math.min(w-1-h,e.n),P=z(e.b,h,i,q),P>=2)){for(K=7>$?7:10,H=r+h&e.y,n=s+Yt[e.C[(K<<4)+H]>>>2]+nt(Xr(e.A,r+h,C(e.b,h-1-1)),1,C(e.b,h-(i+1)-1),C(e.b,h-1)),K=U(K),H=r+h+1&e.y,k=n+Yt[2048-e.C[(K<<4)+H]>>>2],M=k+Yt[2048-e.bb[K]>>>2],y=h+1+P;t+y>m;)e.a[++m].z=268435455;s=M+(rr=Jr(e.i,P-2,H),rr+Cr(e,0,K,H)),x=e.a[t+y],x.z>s&&(x.z=s,x.r=t+h+1,x.j=0,x.t=1,x.Ac=1,x.r2=t,x.j2=i+4)}if(L+=2,L==E)break}}}}}function yr(e,r,t,o){var n,s=Q(t);return n=128>r?e.lb[128*s+r]:e.P[(s<<6)+Zr(r)]+e.nc[15&r],n+Jr(e.$,t-2,o)}function Cr(e,r,t,o){var n;return r?(n=Yt[2048-e.hb[t]>>>2],1==r?n+=Yt[e.Ub[t]>>>2]:(n+=Yt[2048-e.Ub[t]>>>2],n+=wt(e.vc[t],r-2))):(n=Yt[e.hb[t]>>>2],n+=Yt[2048-e._[(t<<4)+o]>>>2]),n}function zr(e,r,t){return Yt[e.hb[r]>>>2]+Yt[e._[(r<<4)+t]>>>2]}function Fr(e){kr(e),Dt(e.d),gt(e.C),gt(e._),gt(e.bb),gt(e.hb),gt(e.Ub),gt(e.vc),gt(e.Sb),et(e.A);for(var r=0;4>r;++r)gt(e.K[r].G);jr(e.$,1<<e.Y),jr(e.i,1<<e.Y),gt(e.S.G),e.N=0,e.jb=0,e.q=0,e.s=0}function Ir(e,r){r>0&&(Y(e.b,r),e.s+=r)}function xr(e){var r=0;return e.D=H(e.b,e.m),e.D>0&&(r=e.m[e.D-2],r==e.n&&(r+=z(e.b,r-1,e.m[e.D-1],273-r))),++e.s,r}function Nr(e){e.b&&e.W&&(e.b.cc=null,e.W=0)}function Or(e){Nr(e),e.d.Ab=null}function Ar(e,r){e.ab=r;for(var t=0;r>1<<t;++t);e.$b=2*t}function Hr(e,r){var t=e.X;e.X=r,e.b&&t!=e.X&&(e.wb=-1,e.b=null)}function Gr(e,r){e.fc[0]=9*(5*e.Y+e.eb)+e.fb<<24>>24;for(var t=0;4>t;++t)e.fc[1+t]=e.ab>>8*t<<24>>24;k(r,e.fc,0,5)}function Wr(e,r){if(e.Gc){kt(e.d,e.C,(e.l<<4)+r,1),kt(e.d,e.bb,e.l,0),e.l=7>e.l?7:10,Kr(e.$,e.d,0,r);var t=Q(2);mt(e.K[t],e.d,63),Rt(e.d,67108863,26),pt(e.S,e.d,15)}}function Tr(e){return 2048>e?Zt[e]:2097152>e?Zt[e>>10]+20:Zt[e>>20]+40}function Zr(e){return 131072>e?Zt[e>>6]+12:134217728>e?Zt[e>>16]+32:Zt[e>>26]+52}function Yr(e,r,t,o){8>t?(kt(r,e.db,0,0),mt(e.Vb[o],r,t)):(t-=8,kt(r,e.db,0,1),8>t?(kt(r,e.db,1,0),mt(e.Wb[o],r,t)):(kt(r,e.db,1,1),mt(e.ic,r,t-8)))}function Vr(e){e.db=t(2),e.Vb=t(16),e.Wb=t(16),e.ic=ft({},8);for(var r=0;16>r;++r)e.Vb[r]=ft({},3),e.Wb[r]=ft({},3);return e}function jr(e,r){gt(e.db);for(var t=0;r>t;++t)gt(e.Vb[t].G),gt(e.Wb[t].G);gt(e.ic.G)}function $r(e,r,t,o,n){var s,i,_,a,c;for(s=Yt[e.db[0]>>>2],i=Yt[2048-e.db[0]>>>2],_=i+Yt[e.db[1]>>>2],a=i+Yt[2048-e.db[1]>>>2],c=0,c=0;8>c;++c){if(c>=t)return;o[n+c]=s+dt(e.Vb[r],c)}for(;16>c;++c){if(c>=t)return;o[n+c]=_+dt(e.Wb[r],c-8)}for(;t>c;++c)o[n+c]=a+dt(e.ic,c-8-8)}function Kr(e,r,t,o){Yr(e,r,t,o),0==--e.sc[o]&&($r(e,o,e.rb,e.Cc,272*o),e.sc[o]=e.rb)}function qr(e){return Vr(e),e.Cc=[],e.sc=[],e}function Jr(e,r,t){return e.Cc[272*t+r]}function Qr(e,r){for(var t=0;r>t;++t)$r(e,t,e.rb,e.Cc,272*t),e.sc[t]=e.rb}function Ur(e,r,o){var n,s;if(null==e.V||e.u!=o||e.I!=r)for(e.I=r,e.qc=(1<<r)-1,e.u=o,s=1<<e.u+e.I,e.V=t(s),n=0;s>n;++n)e.V[n]=ot({})}function Xr(e,r,t){return e.V[((r&e.qc)<<e.u)+((255&t)>>>8-e.u)]}function et(e){var r,t=1<<e.u+e.I;for(r=0;t>r;++r)gt(e.V[r].tb)}function rt(e,r,t){var o,n,s=1;for(n=7;n>=0;--n)o=t>>n&1,kt(r,e.tb,s,o),s=s<<1|o}function tt(e,r,t,o){var n,s,i,_,a=1,c=1;for(s=7;s>=0;--s)n=o>>s&1,_=c,a&&(i=t>>s&1,_+=1+i<<8,a=i==n),kt(r,e.tb,_,n),c=c<<1|n}function ot(e){return e.tb=t(768),e}function nt(e,r,t,o){var n,s,i=1,_=7,a=0;if(r)for(;_>=0;--_)if(s=t>>_&1,n=o>>_&1,a+=wt(e.tb[(1+s<<8)+i],n),i=i<<1|n,s!=n){--_;break}for(;_>=0;--_)n=o>>_&1,a+=wt(e.tb[i],n),i=i<<1|n;return a}function st(e){e.j=-1,e.t=0}function it(e){e.j=0,e.t=0}function _t(e,r){return e.F=r,e.G=t(1<<r),e}function at(e,r){var t,o=1;for(t=e.F;0!=t;--t)o=(o<<1)+vt(r,e.G,o);return o-(1<<e.F)}function ct(e,r){var t,o,n=1,s=0;for(o=0;e.F>o;++o)t=vt(r,e.G,n),n<<=1,n+=t,s|=t<<o;return s}function ut(e,r,t,o){var n,s,i=1,_=0;for(s=0;o>s;++s)n=vt(t,e,r+i),i<<=1,i+=n,_|=n<<s;return _}function ft(e,r){return e.F=r,e.G=t(1<<r),e}function mt(e,r,t){var o,n,s=1;for(n=e.F;0!=n;)--n,o=t>>>n&1,kt(r,e.G,s,o),s=s<<1|o}function dt(e,r){var t,o,n=1,s=0;for(o=e.F;0!=o;)--o,t=r>>>o&1,s+=wt(e.G[n],t),n=(n<<1)+t;return s}function pt(e,r,t){var o,n,s=1;for(n=0;e.F>n;++n)o=1&t,kt(r,e.G,s,o),s=s<<1|o,t>>=1}function ht(e,r){var t,o,n=1,s=0;for(o=e.F;0!=o;--o)t=1&r,r>>>=1,s+=wt(e.G[n],t),n=n<<1|t;return s}function Pt(e,r,t,o,n){var s,i,_=1;for(i=0;o>i;++i)s=1&n,kt(t,e,r+_,s),_=_<<1|s,n>>=1}function lt(e,r,t,o){var n,s,i=1,_=0;for(s=t;0!=s;--s)n=1&o,o>>>=1,_+=Yt[(2047&(e[r+i]-n^-n))>>>2],i=i<<1|n;return _}function vt(e,r,t){var o,n=r[t];return o=(e.E>>>11)*n,(-2147483648^o)>(-2147483648^e.Bb)?(e.E=o,r[t]=n+(2048-n>>>5)<<16>>16,-16777216&e.E||(e.Bb=e.Bb<<8|l(e.Ab),e.E<<=8),0):(e.E-=o,e.Bb-=o,r[t]=n-(n>>>5)<<16>>16,-16777216&e.E||(e.Bb=e.Bb<<8|l(e.Ab),e.E<<=8),1)}function Bt(e,r){var t,o,n=0;for(t=r;0!=t;--t)e.E>>>=1,o=e.Bb-e.E>>>31,e.Bb-=e.E&o-1,n=n<<1|1-o,-16777216&e.E||(e.Bb=e.Bb<<8|l(e.Ab),e.E<<=8);return n}function St(e){e.Bb=0,e.E=-1;for(var r=0;5>r;++r)e.Bb=e.Bb<<8|l(e.Ab)}function gt(e){for(var r=e.length-1;r>=0;--r)e[r]=1024}function kt(e,r,t,s){var i,_=r[t];i=(e.E>>>11)*_,s?(e.xc=o(e.xc,n(a(i),[4294967295,0])),e.E-=i,r[t]=_-(_>>>5)<<16>>16):(e.E=i,r[t]=_+(2048-_>>>5)<<16>>16),-16777216&e.E||(e.E<<=8,bt(e))}function Rt(e,r,t){for(var n=t-1;n>=0;--n)e.E>>>=1,1==(r>>>n&1)&&(e.xc=o(e.xc,a(e.E))),-16777216&e.E||(e.E<<=8,bt(e))}function Mt(e){return o(o(a(e.Jb),e.mc),[4,0])}function Dt(e){e.mc=Gt,e.xc=Gt,e.E=-1,e.Jb=1,e.Oc=0}function bt(e){var r,t=c(p(e.xc,32));if(0!=t||s(e.xc,[4278190080,0])<0){e.mc=o(e.mc,a(e.Jb)),r=e.Oc;do g(e.Ab,r+t),r=255;while(0!=--e.Jb);e.Oc=c(e.xc)>>>24}++e.Jb,e.xc=m(n(e.xc,[16777215,0]),8)}function wt(e,r){return Yt[(2047&(e-r^-r))>>>2]}function Et(e){for(var r,t,o,n=0,s=0,i=e.length,_=[],a=[];i>n;++n,++s){if(r=255&e[n],128&r)if(192==(224&r)){if(n+1>=i)return e;if(t=255&e[++n],128!=(192&t))return e;a[s]=(31&r)<<6|63&t}else{if(224!=(240&r))return e;
if(n+2>=i)return e;if(t=255&e[++n],128!=(192&t))return e;if(o=255&e[++n],128!=(192&o))return e;a[s]=(15&r)<<12|(63&t)<<6|63&o}else{if(!r)return e;a[s]=r}16383==s&&(_.push(String.fromCharCode.apply(String,a)),s=-1)}return s>0&&(a.length=s,_.push(String.fromCharCode.apply(String,a))),_.join("")}function Lt(e){var r,t,o,n=[],s=0,i=e.length;if("object"==typeof e)return e;for(R(e,0,i,n,0),o=0;i>o;++o)r=n[o],r>=1&&127>=r?++s:s+=!r||r>=128&&2047>=r?2:3;for(t=[],s=0,o=0;i>o;++o)r=n[o],r>=1&&127>=r?t[s++]=r<<24>>24:!r||r>=128&&2047>=r?(t[s++]=(192|r>>6&31)<<24>>24,t[s++]=(128|63&r)<<24>>24):(t[s++]=(224|r>>12&15)<<24>>24,t[s++]=(128|r>>6&63)<<24>>24,t[s++]=(128|63&r)<<24>>24);return t}function yt(e){return e[1]+e[0]}function Ct(e,t,o,n){function s(){try{for(var e,r=(new Date).getTime();rr(a.c.yb);)if(i=yt(a.c.yb.Pb)/yt(a.c.Tb),(new Date).getTime()-r>200)return n(i),Nt(s,0),0;n(1),e=S(a.c.Nb),Nt(o.bind(null,e),0)}catch(t){o(null,t)}}var i,_,a={},c=void 0===o&&void 0===n;if("function"!=typeof o&&(_=o,o=n=0),n=n||function(e){return void 0!==_?r(e,_):void 0},o=o||function(e,r){return void 0!==_?postMessage({action:Ft,cbn:_,result:e,error:r}):void 0},c){for(a.c=w({},Lt(e),Vt(t));rr(a.c.yb););return S(a.c.Nb)}try{a.c=w({},Lt(e),Vt(t)),n(0)}catch(u){return o(null,u)}Nt(s,0)}function zt(e,t,o){function n(){try{for(var e,r=0,i=(new Date).getTime();rr(c.d.yb);)if(++r%1e3==0&&(new Date).getTime()-i>200)return _&&(s=yt(c.d.yb.Z.g)/a,o(s)),Nt(n,0),0;o(1),e=Et(S(c.d.Nb)),Nt(t.bind(null,e),0)}catch(u){t(null,u)}}var s,i,_,a,c={},u=void 0===t&&void 0===o;if("function"!=typeof t&&(i=t,t=o=0),o=o||function(e){return void 0!==i?r(_?e:-1,i):void 0},t=t||function(e,r){return void 0!==i?postMessage({action:It,cbn:i,result:e,error:r}):void 0},u){for(c.d=L({},e);rr(c.d.yb););return Et(S(c.d.Nb))}try{c.d=L({},e),a=yt(c.d.Tb),_=a>-1,o(0)}catch(f){return t(null,f)}Nt(n,0)}var Ft=1,It=2,xt=3,Nt="function"==typeof setImmediate?setImmediate:setTimeout,Ot=4294967296,At=[4294967295,-Ot],Ht=[0,-0x8000000000000000],Gt=[0,0],Wt=[1,0],Tt=function(){var e,r,t,o=[];for(e=0;256>e;++e){for(t=e,r=0;8>r;++r)0!=(1&t)?t=t>>>1^-306674912:t>>>=1;o[e]=t}return o}(),Zt=function(){var e,r,t,o=2,n=[0,1];for(t=2;22>t;++t)for(r=1<<(t>>1)-1,e=0;r>e;++e,++o)n[o]=t<<24>>24;return n}(),Yt=function(){var e,r,t,o,n=[];for(r=8;r>=0;--r)for(o=1<<9-r-1,e=1<<9-r,t=o;e>t;++t)n[t]=(r<<6)+(e-t<<6>>>9-r-1);return n}(),Vt=function(){var e=[{s:16,f:64,m:0},{s:20,f:64,m:0},{s:19,f:64,m:1},{s:20,f:64,m:1},{s:21,f:128,m:1},{s:22,f:128,m:1},{s:23,f:128,m:1},{s:24,f:255,m:1},{s:25,f:255,m:1}];return function(r){return e[r-1]||e[6]}}();return"undefined"==typeof onmessage||"undefined"!=typeof window&&void 0!==window.document||!function(){onmessage=function(r){r&&r.gc&&(r.gc.action==It?e.decompress(r.gc.gc,r.gc.cbn):r.gc.action==Ft&&e.compress(r.gc.gc,r.gc.Rc,r.gc.cbn))}}(),{compress:Ct,decompress:zt}}();this.LZMA=this.LZMA_WORKER=e;


//Definitions

//Changes to 1 after init
var start = 0;
//Length of 1D block array
var blockLen=0;
//Camera location
var cam=[0,0,0];
//Camera offset
var xx=-1;
var yy=-1;
var zz=-1;


//List of messages we are going to send 
var sendList=[];

//List of active chunks 
var activeChunks=[];

//How far to draw out
var viewDist=10;
//How far to draw down/up
var zView=4;

//Chunk Dimensions
var chunkXY=0;
var chunkZ=0;
var chunkSpace=64;
//Chunk List
var chunk=[];
//Returnx X,Y,Z from index
var chunkInd=[];
//Empty chunk 
var chunkList=[];

//Draw color
var color=5;


//Function to create new compressin Worker
function newCompressionWorker(){
	
	
	//Start culling proccess and send chunk data
	compressionWorker = new Worker('./renderCompression.js');
	//CullWorker Messaging
	compressionWorker.addEventListener('message', function(e) {
	  message = e.data;
	  switch(message.id){
		 case "finish":
		 chunk[message.chunkID].blockList = message.blockList;
		 chunk[message.chunkID].culledList = message.culledList;
		 chunk[message.chunkID].chunkreDraw=2;
		 chunk[message.chunkID].needsDecompress=0;
		 		 
		 break;
		case "chunkData":
			chunk[message.chunkID].blockListCompressed = message.blockListCompressed;
			chunk[message.chunkID].culledListCompressed = message.culledListCompressed;
			chunk[message.chunkID].chunkreCompress = 0;
			chunk[message.chunkID].compressType=1;
		break;
	  }
	});

}

newCompressionWorker();

//Returns chunkID from x,y,z in block space
return_chunkID = function(x,y,z){
	return(x+y*chunkSpace+z*chunkSpace*chunkSpace);
}




chunk_create = function(x,y,z){
	//If chunk doesn't already exist
	var chunkID = return_chunkID(x,y,z);
	if(chunk[chunkID]==null){
		activeChunks.push(chunkID);
		//Create new chunk
		chunk[chunkID]={
			//coordinates
			coords : [x,y,z],
			//list of blocks
			//blockList : chunkList.slice(),
			//list of culled blocks
			//culledList : chunkList.slice(),
			//Whether the chunk needs to be redrawn
			chunkreDraw : 0,	
			chunkreCompress : 0,
			compressType : 0,
			needsDecompress : 0,
			drawLength : 0,
			chunkChanged : 1,
			blockListCompressed : [],
			culledListCompressed :[],
		}
		
	}
	chunk[chunkID].blockList = 	 new Uint8Array(blockLen);
	chunk[chunkID].blockList.fill(0);
	chunk[chunkID].culledList = new Uint8Array(blockLen);
	chunk[chunkID].culledList.fill(0);
	return(chunkID);
}


chunk_checkCull=function(chunkID){
	//Loop through culled List 
	var changed=0;
	var len = chunk[chunkID].culledList.length;
	for(var k=0;k<len;k++){
		//If block exists and is marked to be culled
		if(chunk[chunkID].blockList[k]!=0 && chunk[chunkID].culledList[k]==0){
			
			//Get real position of block
			var pos = block_location(chunk[chunkID].coords[0],chunk[chunkID].coords[1],chunk[chunkID].coords[2],k);
			//Check surrounding blocks
			if(
			block_exists(pos[0],pos[1],pos[2]-1)
			&& block_exists(pos[0],pos[1],pos[2]+1)
			&& block_exists(pos[0],pos[1]-1,pos[2])				
			&& block_exists(pos[0],pos[1]+1,pos[2])		
			&& block_exists(pos[0]-1,pos[1],pos[2])
			&&block_exists(pos[0]+1,pos[1],pos[2])		
			){
				//Set to culled
				if(chunk[chunkID].culledList[k]>1){
					changed=1;
				}
				chunk[chunkID].culledList[k]=1;
			}else{
				//Set to block type
				if(chunk[chunkID].culledList[k]!=chunk[chunkID].blockList[k]){
					changed=1;
				}
				chunk[chunkID].culledList[k]=chunk[chunkID].blockList[k];
			}
		}
	}
	return(changed);
}


//Gets real XYZ from chunk x y z and id
block_location = function(x,y,z,id){
	return([chunkInd[id][0]+x*chunkXY,chunkInd[id][1]+y*chunkXY,chunkInd[id][2]+z*chunkZ]);

}

//gets id from XYZ
location_block = function(x,y,z){

	//get Chunk location
	var chunkRef = chunk_get(x,y,z);
	var chunkID = return_chunkID(chunkRef[0],chunkRef[1],chunkRef[2]);
	//get relative location in chunk
	var blockLoc = [x - (chunkRef[0]*chunkXY), y - (chunkRef[1]*chunkXY),z-(chunkRef[2]*chunkZ)]
	//get index from relative location

	//If its in a non existant chunk send back a -1
	if(chunk[chunkID]==null ){return(-1);}
	return( [ chunkID, blockLoc[0]+blockLoc[1]*chunkXY+blockLoc[2]*chunkXY*chunkXY]);
	
}

block_setCull=function(x,y,z){
	//get ID from xyz
	var blockId = location_block(x,y,z);
	//If the chunk exists
	if(blockId!=-1){
	//set blocked to non-culled
		chunk[blockId[0]].culledList[blockId[1]]=0;
	}	
}

block_cullSurrounding=function(x,y,z){
	block_setCull(x,y,z-1);
	block_setCull(x,y,z+1);
	block_setCull(x,y-1,z);
	block_setCull(x,y+1,z);
	block_setCull(x-1,y,z);
	block_setCull(x+1,y,z);
	block_setCull(x,y,z);
}


//Checks if block exists from XYZ
block_exists = function ( x,y,z ) {
	//get ID from xyz
	var blockId = location_block(x,y,z);
	//If the chunk exists
	if(blockId!=-1){
	//If the block exists
		if(chunk[blockId[0]].blockList[blockId[1]]!=0){return(1);}
	}
	return(0);//Doesn't exist
}


block_create = function(x,y,z,dontCull){
	

	//get Chunk locationd
	var chunkRef = chunk_get(x,y,z);
	var chunkID = return_chunkID(chunkRef[0],chunkRef[1],chunkRef[2]);

	//get relative location in chunk
	var blockLoc = [x - (chunkRef[0]*chunkXY), y - (chunkRef[1]*chunkXY),z - (chunkRef[2]*chunkZ)]
	
	
	//get index from relative location
	var blockIndex = blockLoc[0]+blockLoc[1]*chunkXY+blockLoc[2]*chunkXY*chunkXY;
	//Generate chunk if it doesn't exists
	
	if(chunk[chunkID]==null){
	chunk_create(chunkRef[0],chunkRef[1],chunkRef[2]);
	}

	
	//If there is not a block at this location
	if(chunk[chunkID].blockList[blockIndex]==0 && chunk[chunkID].needsDecompress==0){
		
		//Set block to solid
		chunk[chunkID].blockList[blockIndex]=color;
		//Set chunk to be redrawn
		chunk[chunkID].chunkreDraw=1;	
		chunk[chunkID].chunkChanged=1;
		if(dontCull==1){
			chunk[chunkID].culledList[blockIndex]=1;
		}else{
			block_cullSurrounding();
		}
		
	}else{
		if(dontCull==1 && chunk[chunkID].culledList[blockIndex]!=1 && chunk[chunkID].needsDecompress==0){
		block_cullSurrounding(x,y,z);
		}
	}
}


block_delete = function(x,y,z){
	//get Chunk location
	var chunkRef = chunk_get(x,y,z);
	
	var chunkID = return_chunkID(chunkRef[0],chunkRef[1],chunkRef[2]);
	//get relative location in chunk
	var blockLoc = [x - (chunkRef[0]*chunkXY), y - (chunkRef[1]*chunkXY),z-(chunkRef[2]*chunkZ)]
	//get index from relative location
	var blockIndex = blockLoc[0]+blockLoc[1]*chunkXY+blockLoc[2]*chunkXY*chunkXY;

	if(chunk[chunkID]!=null) {
		//If there is a block 
		if(chunk[chunkID].blockList[blockIndex]!=0 && chunk[chunkID].needsDecompress<1){

			//Set block to non-solid
			chunk[chunkID].blockList[blockIndex]=0;
			block_cullSurrounding(x,y,z);
			//redraw chunk
			chunk[chunkID].chunkreDraw=3;	
			chunk[chunkID].chunkChanged=1;
		}
		
	}


}

//3D distance (used for sphere building mainly right now)
function distance( v1, v2 )
{
    var dx = v1[0] - v2[0];
    var dy = v1[1] - v2[1];
    var dz = v1[2] - v2[2];

    return Math.sqrt( dx * dx + dy * dy + dz * dz );
}

//Takes a byte 0-255 and returns a color 
return_color = function(a){
	switch(a){
		default:
		return([0,0,0]);
		break;
		//Grass
		case 1:
		return([0,0,0]);	
		break
		//Dirt
		case 2:
		return([60,13,11]);
		break;
		case 3:
		return([70,6,154]);
		break;
		case 4:
		return([35,35,35]);
		break;
		case 5:
		return([10,50,5]);
		break;
	}
}

//Greedy meshing

var mask = new Int32Array(4096);
greedy = function(chunkID,chunkPos) {
	var volume=chunk[chunkID].culledList;
	if(volume==undefined){
		console.log(chunkID);
		console.log(chunk[chunkID]);
	}
	var dims=[chunkXY,chunkXY,chunkZ];
  function f(i,j,k) {
    return volume[i + dims[0] * (j + dims[1] * k)];
  }
  //Sweep over 3-axes
  var vertices = [], faces = [];
  for(var d=0; d<3; ++d) {
	  
    var i, j, k, l, w, h
      , u = (d+1)%3
      , v = (d+2)%3
      , x = [0,0,0]
      , q = [0,0,0];
    if(mask.length < dims[u] * dims[v]) {
      mask = new Int32Array(dims[u] * dims[v]);
    }
    q[d] = 1;
	
	//For each slice in this chunk
    for(x[d]=-1; x[d]<dims[d]; ) {
      //Compute mask
      var n = 0;
	  
	  //Loop through first axis 
      for(x[v]=0; x[v]<dims[v]; ++x[v])
		//Loop through second axis
      for(x[u]=0; x[u]<dims[u]; ++x[u], ++n) {
			//To get the direction, you use d, then you use q to determine which way it is facing
			//You can then use that to determine face value 
			
			//A is the first block we are checking
        var a = (0    <= x[d]      ? f(x[0],      x[1],      x[2])      : 0 )
			//B is the second block we are checking
          , b = (x[d] <  dims[d]-1 ? f(x[0]+q[0], x[1]+q[1], x[2]+q[2]) : 0);
		  

		  //If they are the same, or are both 0  (because if they are the same, there isn't a face between)
        if((!!a) === (!!b)) {
          mask[n] = 0;
		  //If a exists, but b doesn't 
        } else if(!!a) {
          mask[n] = a;
		  //If b exists but a doesn't
        } else {
          mask[n] = -b;
        }
      }
      //Increment x[d]
      ++x[d];
      //Generate mesh for mask using lexicographic ordering
      n = 0;
      for(j=0; j<dims[v]; ++j)
      for(i=0; i<dims[u]; ) {
        var c = mask[n];
		if(c==-1 || c==1){
			c=0;
		}
        if(!!c) {
          //Compute width
          for(w=1; c === mask[n+w] && i+w<dims[u]; ++w) {
          }
          //Compute height (this is slightly awkward
          var done = false;
          for(h=1; j+h<dims[v]; ++h) {
            for(k=0; k<w; ++k) {
              if(c !== mask[n+k+h*dims[u]]) {
                done = true;
                break;
              }
            }
            if(done) {
              break;
            }
          }
          //Add quad
          x[u] = i;  x[v] = j;
          var du = [0,0,0]
            , dv = [0,0,0]; 
          if(c > 0) {
            dv[v] = h;
            du[u] = w;
          } else {
            c = -c;
            du[v] = h;
            dv[u] = w;
          }
		  
		var col = return_color(c);  

		switch(d){
			case 0:
			if(c>0){
				col=[col[0]*0.9,col[1]*0.9,col[2]*0.9];		
			}else{
				col=[col[0]*0.8,col[1]*0.8,col[2]*0.8];					
			}	
			break;
			case 1:
			if(c>0){
				col=[col[0]*0.7,col[1]*0.7,col[2]*0.7];		
			}else{
				col=[col[0]*0.6,col[1]*0.6,col[2]*0.6];			
			}			
			break;
			case 2:
			if(c>0){
				//bottom
				col=[col[0]*0.5,col[1]*0.5,col[2]*0.5];
			}
				//top
								
			
			break;
		}
		  
          vertices.push(x[0]+chunkPos[0],             x[1]+chunkPos[1],             x[2]   +chunkPos[2]         );
          vertices.push(x[0]+du[0]+chunkPos[0],       x[1]+du[1]+chunkPos[1],       x[2]+du[2]+chunkPos[2]      );
          vertices.push(x[0]+du[0]+dv[0]+chunkPos[0], x[1]+du[1]+dv[1]+chunkPos[1], x[2]+du[2]+dv[2]+chunkPos[2]);
          vertices.push(x[0]      +dv[0]+chunkPos[0], x[1]      +dv[1]+chunkPos[1], x[2]      +dv[2]+chunkPos[2]);

          faces.push(col[0],col[1],col[2],col[0],col[1],col[2],col[0],col[1],col[2],col[0],col[1],col[2],);
          //Zero-out mask
          for(l=0; l<h; ++l)
          for(k=0; k<w; ++k) {
            mask[n+k+l*dims[u]] = 0;
          }
          //Increment counters and continue
          i += w; n += w;
        } else {
          ++i;    ++n;
        }
      }
    }
  }
  return([ new Int16Array(vertices), new Uint8Array(faces) ]);
}


chunk_get =function(x,y,z){
	return([Math.floor(x/chunkXY),Math.floor(y/chunkXY),Math.floor(z/chunkZ)]);
}


//Sets a chunk drawing data if needed
draw_chunk =function(chunkID){
	
	//Mark chunk as not needing a redraw
	chunk[chunkID].chunkreDraw=0;
	//Get chunk position to displace blocks with inside of the meth
	var chunkPos = [(chunk[chunkID].coords[0]*chunkXY),(chunk[chunkID].coords[1]*chunkXY),(chunk[chunkID].coords[2]*chunkZ)];
	//Mesh the blocklist 
	var get = greedy(chunkID,chunkPos);;
	//Add draw data to send list
	sendList.push({
		coords: [chunk[chunkID].coords[0],chunk[chunkID].coords[1],chunk[chunkID].coords[2]],
		position : get[0],
		color : get[1],
		blockList : chunk[chunkID].blockList,
	});;
	
	chunk[chunkID].drawLength = get[0].length;
}


//Messaging from main thread
self.addEventListener('message', function(e) {
	var message = e.data;
	
	switch(message.id){
		
		//Big delete cube radius
		case "bigDelete":
		cam = message.cam;
		var blockDel = message.blockDel;
		for(var xx=-blockDel;xx<=blockDel;xx++){
			for(var yy=-blockDel;yy<=blockDel;yy++){
				for(var zz=-blockDel;zz<=blockDel;zz++){
					block_delete(Math.round(cam[0]+xx),Math.round(cam[1]+yy),Math.round(cam[2]+1+zz));
				}
			}
		}
		break;
		
		//Big sphere 
		case "bigSphere":
		var blockBuild=Math.round(message.blockBuild*0.5);
		cam = message.cam;
		color=3;
		for(var xx=-blockBuild;xx<=blockBuild;xx++){
		for(var yy=-blockBuild;yy<=blockBuild;yy++){
		for(var zz=-blockBuild;zz<=blockBuild;zz++){
			var dist=distance([0,0,0],[xx,yy,zz]);
			if(dist<blockBuild){
				
				if(dist>=blockBuild-1){
				block_create(Math.round(cam[0]+xx),Math.round(cam[1]+yy),Math.round(cam[2]+zz),0);
				}else{
				block_create(Math.round(cam[0]+xx),Math.round(cam[1]+yy),Math.round(cam[2]+zz),1);				
				}
			}
		}}}
		break;
		
		//Big cube
		case "bigBlock":
		var blockBuild = message.blockBuild;
		cam = message.cam;
		//For x & y out to the blockBuild variable, and a Z to the ground making a giant cube
		for(var xx=-blockBuild;xx<=blockBuild;xx++){
			for(var yy=-blockBuild;yy<=blockBuild;yy++){
				for(var zz=0;zz<=blockBuild;zz++){
				
				if(zz!=0){
					color=2;
				}else{
					color=5;
				}
				//If the block is at the edge of the cube, it needs to be culled checked.
				if(Math.abs(xx)>=blockBuild || Math.abs(yy)>=blockBuild || zz<=0 || zz>=(blockBuild-1)){
					block_create(Math.round(cam[0]+xx),Math.round(cam[1]+yy),Math.round(cam[2]+zz),0);
				}else{
				//If the block is not at the edge, it doesn't need to be culled check because it is certaintly covered.
					block_create(Math.round(cam[0]+xx),Math.round(cam[1]+yy),Math.round(cam[2]+zz),1);					
				}
			}
			}
		}
		break;
		case "saveMap":
		
		//Decompress save data if it exists
		if(message.file.length!=0){
			message.file=JSON.parse(LZMA.decompress(new Uint8Array(message.file.split(','))));

			
			var testy = message.file.findIndex(function(l){
				return (l[0][0]==0 && l[0][1]==0 && l[0][2]==0);
			});
		}

		
		console.log("saving map");
		var loopLen=activeChunks.length;
		for(var h = 0 ; h<loopLen;h++){
			//if chunk has changed
			if(chunk[activeChunks[h]].chunkChanged==1){
				
				var findIndex = message.file.findIndex(function(l){
				return (l[0][0]==chunk[activeChunks[h]].coords[0] && l[0][1]==chunk[activeChunks[h]].coords[1] && l[0][2]==chunk[activeChunks[h]].coords[2]);
				});
				if(findIndex!=-1){
					message.file.splice(findIndex,1);
				}
				
				
				
				if(chunk[activeChunks[h]].needsDecompress>0){
					chunk[activeChunks[h]].chunkreDraw=0;	
				}
		
		
				if(chunk[activeChunks[h]].chunkreDraw>0 || chunk[activeChunks[h]].drawLength==0){
					chunk_checkCull(activeChunks[h]);
					draw_chunk(activeChunks[h]);
					chunk[activeChunks[h]].chunkreCompress=1;
					
				}
		
				if(chunk[activeChunks[h]].blockListCompressed.length<=0 || chunk[activeChunks[h]].chunkreCompress>0){
					chunk[activeChunks[h]].chunkreCompress=0;
					chunk[activeChunks[h]].compressType=1;
					chunk[activeChunks[h]].culledListCompressed=LZString.compress(chunk[activeChunks[h]].culledList.toString());
					chunk[activeChunks[h]].blockListCompressed=LZString.compress(chunk[activeChunks[h]].blockList.toString());
				}
				console.log("%csaving map: %c"+h +'/'+(loopLen-1)+" compressType: "+chunk[activeChunks[h]].compressType,"color:black","color:green");		
							
				message.file.push([
				chunk[activeChunks[h]].coords,
				chunk[activeChunks[h]].blockListCompressed,
				chunk[activeChunks[h]].culledListCompressed,
				chunk[activeChunks[h]].compressType,
				]);
			}
		}
		message.file = JSON.stringify(message.file);
		var beforeSize = message.file.length;
		message.file = LZMA.compress(message.file,1,function(result){
			console.log("size before: " +beforeSize);
			console.log("final compressed size: "+result);	
			self.postMessage({
				
				id : 'downloadData',
				data : result,
			});
			
		},function(pcent){console.log("%cFinalizing: "+pcent,"color:purple")});
		//LZMA.compress(string || byte_array, mode, on_finish(result, error) {}, on_progress(percent) {});

		

		
		break;
		//Load data
		case "loadData":
		var coords  = message.coords;
		var chunkID = chunk_create(coords[0],coords[1],coords[2]);
		chunk[chunkID].blockListCompressed = message.blockList;
		chunk[chunkID].culledListCompressed = message.culledList;
		chunk[chunkID].chunkChanged=0;
		


		/*if(distance(chunk[chunkID].coords,camChunk)<=1){
		
			if(message.compressType==0){
			chunk[chunkID].blockList = new Uint8Array(LZMA.decompress(message.blockList).split(','));
			chunk[chunkID].culledList = new Uint8Array(LZMA.decompress(message.culledList).split(','));
			}else{
			chunk[chunkID].blockList = new Uint8Array(LZString.decompress(message.blockList).split(','));
			chunk[chunkID].culledList = new Uint8Array(LZString.decompress(message.culledList).split(','));	
			chunk[chunkID].compressType=1;
			}
		}else{*/
		chunk[chunkID].needsDecompress=1;
		//}
		chunk[chunkID].compressType = message.compressType;
		chunk[chunkID].chunkreDraw=2;

		break;
		//Init for when receiving chunk data (size of chunks, view distance)
		case "start":
		console.table([message]);
		chunkXY = message.chunkXY;
		chunkZ = message.chunkZ;
		viewDist = message.viewDist*10.0;
		zView = message.zView*10.0;
		xx=-viewDist;
		yy=-viewDist;
		camChunk = [0,0,0];
		
		//Generate lists with new chunk info
		for(var zz=0;zz<chunkZ;zz++){
			for(var yy=0;yy<chunkXY;yy++){
				for(var xx=0;xx<chunkXY;xx++){
					chunkInd.push([xx,yy,zz]);
					chunkList.push(-1);
				}
			}
		}
		
		//Create empty list for each blok in a chunk
		blockLen =chunkList.length;
		chunkList = new Uint8Array(blockLen);
		chunkList.fill(0);
		
		//Flag start as 1 to start the culling 
		start=1;
		
		break;

		
		
		//Receive block create buffer
		case "block_create":
			color=4;
			block_create(message.coords[0],message.coords[1],message.coords[2],message.dontCull);
		break;
		
		//Receive delete block  buffer
		case "block_delete":
		block_delete(message.coords[0],message.coords[1],message.coords[2]);
		break;
		
		//Camera update interval
		case "camera":
		cam = message.cam;
		viewDist = message.viewDist*10.0;
		zView = message.zView*10.0;
		break;		
	}
});




//The actual culling process
var cullProc =function(){
	var startTime = new Date();
	//If we have init already
	if(start==1){
	/*
		 ___  __  __  __    __    ____  _  _  ___ 
		 / __)(  )(  )(  )  (  )  (_  _)( \( )/ __)
		( (__  )(__)(  )(__  )(__  _)(_  )  (( (_-.
		 \___)(______)(____)(____)(____)(_)\_)\___/
	*/

		var timeMod=0;
		//Get chunk at camera
		camChunk = chunk_get(cam[0],cam[1],cam[2]);
			
		var chunkCullList=[];
		for(var xx=-viewDist;xx<=viewDist;xx++){
		for(var yy=-viewDist;yy<=viewDist;yy++){
		for(var zz=-zView;zz<=zView;zz++){
			var chunkID = return_chunkID(camChunk[0]+xx,camChunk[1]+yy,camChunk[2]+zz);
			if(chunk[chunkID]!=null){	
			
				var chunkRef=chunk[chunkID];
				chunkCullList.push([chunkID,distance(chunkRef.coords,camChunk)]);
			}
		}
		}
		}
		chunkCullList.sort(function(a,b){
			return(a[1]-b[1]);
		});
		var chunkIndex=0;
		
		var going=25;
		if(chunkCullList.length==0){
			going=0;
		}
		
		while(going>0){

			var hitter=0;
			//Get chunk at our current displacement 
			var chunkID = chunkCullList[chunkIndex][0];
			//If the chunk we are working at is defined
			if(chunk[chunkID]!=null){
				var chunkRef = chunk[chunkID];
				//If it needs to be redrawn, redraw it
				if(chunkRef.chunkreDraw>0){
						if(chunkRef.needsDecompress==1){
							chunkRef.needsDecompress=2;
							chunkRef.chunkreDraw=0;
							
							compressionWorker.postMessage({
								id : "decompress",
								chunkID : chunkID,
								blockList : chunk[chunkID].blockListCompressed,
								culledList : chunk[chunkID].culledListCompressed,
								compressType : chunkRef.compressType,
							});
							
							/*if(chunkRef.compressType==1){
								
								chunk[chunkID].blockList = new Uint8Array(LZString.decompress(chunk[chunkID].blockListCompressed).split(','));
								chunk[chunkID].culledList = new Uint8Array(LZString.decompress(chunk[chunkID].culledListCompressed).split(','));
							}else{
								chunk[chunkID].blockList = new Uint8Array(LZMA.decompress(chunk[chunkID].blockListCompressed).split(','));
								chunk[chunkID].culledList = new Uint8Array(LZMA.decompress(chunk[chunkID].culledListCompressed).split(','));							
							}*/
							hitter=1;
						}else{
						
						var testChange=1;
						if(chunkRef.chunkreDraw!=2){
							chunkRef.chunkreCompress=1;
							testChange = chunk_checkCull(chunkID);
						}

						if(testChange==1 || chunkRef.chunkreDraw==3){
							timeMod+=chunkCullList[chunkIndex][1]*130
							draw_chunk(chunkID);

							
							
						}else{
							chunkRef.chunkreCompress=0;
						}
						
						hitter=1;
						}
				}else{
					if(chunkRef.chunkreCompress>0){
						chunkRef.chunkreCompress+=1;
						if(chunkRef.chunkreCompress==2){
							hitter=1;
							timeMod+=chunkCullList[chunkIndex][1]*130
							compressionWorker.postMessage({
								id : "chunkData",
								chunkID : chunkID,
								blockList : chunkRef.blockList,
								culledList : chunkRef.culledList,
							});
						}
					}
				}
			}
			if(hitter==1){
				going=0;
			}
			chunkIndex+=1;
			if(chunkIndex>=chunkCullList.length){
				going=0;
			}
			going--;
		}
			//Loop through chunks in area

}


if(sendList.length>0){
	
	//Send single chunk data at a time
	
	/*var sender=[];
	sender.push(sendList.shift());
	self.postMessage({
		
		id : 'drawData',
		sendList : sender,
	});*/
	
	//Send all chunk data at once
	
	self.postMessage({
		id : "drawData",
		sendList : sendList,
	});
	sendList=[];
}
	var endTime = new Date();
	return(endTime-startTime+timeMod);
}

cullTimer = function(amount){
	setTimeout(function(){
		var cullAmount = cullProc();
		if(cullAmount<500){
			cullAmount=500
		}
		cullTimer(cullAmount*0.5);
	},amount);
}


cullTimer(1);

