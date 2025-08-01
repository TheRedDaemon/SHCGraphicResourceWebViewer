pub const Argb1555 = packed struct {
    b: u5,
    g: u5,
    r: u5,
    a: u1,
};

pub const Rgba8888 = packed struct {
    r: u8,
    g: u8,
    b: u8,
    a: u8,
};

pub const Gray8 = u8;

pub const Alpha1 = u1;
