"use client";

import { Glow } from "@/components/ui/glow";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/ui/icons";

export function GlowHeroDemo() {
  return (
    <div className="flex w-full h-[60vh] relative flex-col items-center justify-center p-8 overflow-hidden rounded-xl">
      {/* Background with Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <Glow 
          variant="center" 
          className={cn(
            "opacity-70",
            "scale-[1.5]",
            "blur-3xl"
          )} 
        />
      </div>

      {/* Content */}
      <Card className="relative z-10 p-12 bg-white/50 dark:bg-black/50 backdrop-blur-xl border-white/20 dark:border-white/10 shadow-2xl rounded-2xl flex flex-col items-center text-center max-w-lg mx-auto">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30">
          <Icons.logo className="text-white w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 mb-3">
          Sẵn sàng tạo văn bản
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
          Hãy tải lên file tham khảo hoặc chọn loại văn bản ở menu bên trái. Hệ thống AI sẽ tự động phân tích và tạo form chuẩn Nghị định 30 cho bạn.
        </p>
      </Card>
    </div>
  );
}
