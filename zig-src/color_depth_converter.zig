const std = @import("std");
const types = @import("types.zig");

pub const Options = struct {
    alpha_threshold: u8,

    pub const default = Options{
        .alpha_threshold = 127,
    };
};

pub var current_options = Options.default;

pub fn convert(allocator: std.mem.Allocator, input: []const u8) ![]const u16 {
    if (input.len % 4 != 0) return error.InvalidInputSize;
    const rgba_image = std.mem.bytesAsSlice(types.Rgba8888, input);

    const output = try allocator.alloc(types.Argb1555, rgba_image.len);
    errdefer allocator.free(output);

    for (rgba_image, output) |*rgba, *argb| {
        argb.r = @truncate(rgba.r >> 3);
        argb.g = @truncate(rgba.g >> 3);
        argb.b = @truncate(rgba.b >> 3);
        argb.a = if (current_options.alpha_threshold > rgba.a) 1 else 0;
    }
    return @ptrCast(output);
}
