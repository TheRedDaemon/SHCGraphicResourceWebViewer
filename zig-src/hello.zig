const std = @import("std");

pub fn hello() void {
    std.debug.print("Hello twice and nice and soft!", .{});
}
