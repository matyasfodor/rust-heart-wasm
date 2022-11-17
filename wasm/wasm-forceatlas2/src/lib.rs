mod utils;

extern crate serde_json;
extern crate wasm_bindgen;

use forceatlas2::{Layout, Nodes, Settings, Coord};
use serde_derive::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;
use std::panic;

// #[macro_use]
extern crate serde_derive;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
// #[cfg(feature = "wee_alloc")]
// #[global_allocator]
// static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}


#[wasm_bindgen]
extern "C" {
    // Use `js_namespace` here to bind `console.log(..)` instead of just
    // `log(..)`
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);

    // The `console.log` is quite polymorphic, so we can bind it with multiple
    // signatures. Note that we need to use `js_name` to ensure we always call
    // `log` in JS.
    #[wasm_bindgen(js_namespace = console, js_name = log)]
    fn log_u32(a: u32);

    // Multiple arguments too!
    #[wasm_bindgen(js_namespace = console, js_name = log)]
    fn log_many(a: &str, b: &str);
}

#[wasm_bindgen]
pub fn greet() {
    alert("Hello, forceatlas2-wasm!");
}

// struct SimpleStruct {

// }

// #[derive(Serialize, Deserialize)]
// struct LayoutSettings<T: Coord>(Settings<T>);

// impl<'de> Deserialize<'de> for LayoutSettings<f32> {
//     fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
//     where
//         D: Deserializer<'de>,
//     {
//         //    #[derive(Deserialize)]
//         //    #[serde(field_identifier, rename_all = "lowercase")]
//         //    enum Field { Secs, Nanos }
//     }
// }

#[derive(Serialize, Deserialize, Debug)]
pub struct SimpleSettings<T: Coord> {
    chunk_size: Option<usize>,
	/// Number of spatial dimensions
	pub dimensions: usize,
	/// Move hubs (high degree nodes) to the center
	pub dissuade_hubs: bool,
	/// Attraction coefficient
	pub ka: T,
	/// Gravity coefficient
	pub kg: T,
	/// Repulsion coefficient
	pub kr: T,
	/// Logarithmic attraction
	pub lin_log: bool,
	/// Prevent node overlapping for a prettier graph (node_size, kr_prime).
	///
	/// `node_size` is the radius around a node where the repulsion coefficient is `kr_prime`.
	/// `kr_prime` is arbitrarily set to `100.0` in Gephi implementation.
	pub prevent_overlapping: Option<(T, T)>,
	/// Speed factor
	pub speed: T,
	/// Gravity does not decrease with distance, resulting in a more compact graph.
	pub strong_gravity: bool,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct GenerateLayoutParameters {
    pub edges: Vec<(usize, usize)>,
    pub nodes: usize,
    pub iterations: usize,
    pub settings: SimpleSettings<f32>,
}
#[wasm_bindgen]
pub fn generate_layout(parameters: JsValue) -> String {
    utils::set_panic_hook();
    let parsed_parameters = serde_wasm_bindgen::from_value::<GenerateLayoutParameters>(parameters).expect("Failed to parse parameters");

    let mut layout = Layout::<f32>::from_graph(
        parsed_parameters.edges,
        Nodes::Degree(parsed_parameters.nodes),
        None,
        Settings {
            // ..parsed_parameters.settings,
            // #[cfg(feature = "barnes_hut")]
            // barnes_hut: None,

            // ..parsed_parameters.settings

            // chunk_size: None,
            // dimensions: 2,
            // dissuade_hubs: false,
            // ka: 0.01,
            // kg: 0.001,
            // kr: 0.002,
            // lin_log: false,
            // speed: 1.0,
            // prevent_overlapping: None,
            // strong_gravity: false,

            chunk_size: parsed_parameters.settings.chunk_size,
            dimensions: parsed_parameters.settings.dimensions,
            dissuade_hubs: parsed_parameters.settings.dissuade_hubs,
            ka: parsed_parameters.settings.ka,
            kg: parsed_parameters.settings.kg,
            kr: parsed_parameters.settings.kr,
            lin_log: parsed_parameters.settings.lin_log,
            speed: parsed_parameters.settings.speed,
            prevent_overlapping: parsed_parameters.settings.prevent_overlapping,
            strong_gravity: parsed_parameters.settings.strong_gravity,
        },
    );

    for _ in 0..parsed_parameters.iterations {
        layout.iteration();
    }

    let ret: Vec<(f32, f32)> = layout.points.iter().map(|pos| (pos[0], pos[1])).collect();

    serde_json::to_string(&ret).unwrap()
}
