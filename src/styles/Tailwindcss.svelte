<style type="text/postcss" global>
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  
  .rounded-large {
    border-radius: 16px;
  }
  
  .rounded-largest {
    border-radius: 24px;
  }

  .text-smallest {
    font-size: 9px;
  }

  .shimmer {
    animation: shimmer 1s infinite linear;
    background: #f6f7f8;
    background-image: linear-gradient(to right, #f6f7f8 0%, #edeef1 20%, #f6f7f8 40%, #f6f7f8 100%);
    background-size: 800px; 
    @apply bg-no-repeat;
  }

  @keyframes shimmer {
    0% {
      background-position: -468px 0;
    }
    
    100% {
      background-position: 468px 0; 
    }
  }
</style>